import os
import shutil
import uuid
from fastapi import APIRouter, Depends, HTTPException, status, UploadFile, File, Form
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy.future import select
from typing import List, Optional

from ..database import get_db
from ..models import User, MedicalDocument
from ..schemas import MedicalDocumentResponse
from ..auth import get_current_user
from ..services.cloudinary_service import upload_file as cloudinary_upload, delete_file as cloudinary_delete, get_public_id_from_url

router = APIRouter(prefix="/documents", tags=["documents"])

UPLOAD_DIR = "uploads/documents"
os.makedirs(UPLOAD_DIR, exist_ok=True)

import base64
from ..config import settings

@router.post("/upload", response_model=MedicalDocumentResponse)
async def upload_document(
    document_type: str = Form(...),
    file: UploadFile = File(...),
    current_user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db)
):
    # Upload to Cloudinary
    try:
        cloudinary_url = cloudinary_upload(file.file, folder="documents")
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Cloudinary upload failed: {str(e)}"
        )
        
    extracted_data = {}
    ai_confidence = 0.0
    
    # AI Extraction (Vision)
    vision_model = "z-ai/glm-4.6v-flash-free"
    api_key = settings.ZENMUX_API_KEY or settings.OPENAI_API_KEY
    base_url = "https://zenmux.ai/api/v1" if settings.ZENMUX_API_KEY else None
    
    if api_key:
        try:
            # Use the secure URL from Cloudinary for AI extraction
            from openai import AsyncOpenAI
            client = AsyncOpenAI(api_key=api_key, base_url=base_url)
            
            # Use the secure URL instead of base64 if the model supports it, 
            # but here it uses a data URL with base64. Let's keep base64 for now but read it differently.
            # Actually, let's try to pass the Cloudinary URL.
            image_url = cloudinary_url
            
            response = await client.chat.completions.create(
                model=vision_model,
                messages=[
                    {
                        "role": "system",
                        "content": "You are a clinical document parser. Extract JSON data from the medical image. Fields: patient_name, date, test_type, results (list of key-value), summary."
                    },
                    {
                        "role": "user",
                        "content": [
                            {"type": "text", "text": "Extract clinical data from this medical document."},
                            {"type": "image_url", "image_url": {"url": image_url}}
                        ]
                    }
                ]
            )
            content = response.choices[0].message.content
            # Clean markdown code blocks if present
            if content.startswith("```"):
                content = content.split("```")[1]
                if content.startswith("json"):
                    content = content[4:]
                content = content.split("```")[0].strip()
            
            import json
            extracted_data = json.loads(content)
            ai_confidence = 0.95 # Mock confidence for now
        except Exception as e:
            print(f"AI Extraction failed: {e}")
    
    db_document = MedicalDocument(
        student_id=current_user.id,
        document_type=document_type,
        file_path=cloudinary_url,
        file_name=file.filename,
        extracted_data=extracted_data,
        ai_confidence=ai_confidence,
        status="pending"
    )
    
    db.add(db_document)
    await db.commit()
    await db.refresh(db_document)
    
    return db_document

@router.get("/", response_model=List[MedicalDocumentResponse])
async def list_documents(
    current_user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db)
):
    if current_user.role == "staff" or current_user.role == "admin":
        result = await db.execute(select(MedicalDocument))
    else:
        result = await db.execute(select(MedicalDocument).where(MedicalDocument.student_id == current_user.id))
        
    documents = result.scalars().all()
    return documents

@router.delete("/{document_id}", status_code=status.HTTP_204_NO_CONTENT)
async def delete_document(
    document_id: str,
    current_user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db)
):
    # Find the document
    result = await db.execute(select(MedicalDocument).where(MedicalDocument.id == document_id))
    db_document = result.scalar_one_or_none()
    
    if not db_document:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Document not found"
        )
        
    # Permission check: Owner or Staff/Admin
    if current_user.role not in ["staff", "admin"] and db_document.student_id != current_user.id:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Not authorized to delete this document"
        )
        
    # Delete from Cloudinary
    if db_document.file_path and "cloudinary" in db_document.file_path:
        public_id = get_public_id_from_url(db_document.file_path)
        if public_id:
            try:
                cloudinary_delete(public_id)
            except Exception as e:
                print(f"Error deleting file from Cloudinary {public_id}: {e}")
            
    # Delete from database
    await db.delete(db_document)
    await db.commit()
    
    return None
