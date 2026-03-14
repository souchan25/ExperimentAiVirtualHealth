import os
from datetime import date
from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy.future import select
from typing import List

from ..database import get_db
from ..models import User, ExcuseSlip, SymptomRecord
from ..schemas import ExcuseSlipResponse, ExcuseSlipCreate
from ..auth import get_current_user
from ..services.cloudinary_service import upload_file as cloudinary_upload
import io
from pathlib import Path

router = APIRouter(prefix="/excuse-slips", tags=["excuse_slips"])

from reportlab.lib.pagesizes import letter
from reportlab.pdfgen import canvas
from reportlab.lib import colors
from reportlab.lib.units import inch
import uuid

def generate_medical_slip(buffer, student, issuer, slip_in):
    c = canvas.Canvas(buffer, pagesize=letter)
    width, height = letter
    
    # Draw Logo - use relative path from FastAPI root
    logo_path = Path(__file__).parent.parent.parent / "assets" / "cpsu-logo.png"
    if logo_path.exists():
        c.drawImage(str(logo_path), 1*inch, height - 1.4*inch, width=0.8*inch, height=0.8*inch, mask='auto')
    
    # Header Text (Aligned with Logo)
    c.setFont("Helvetica-Bold", 14)
    c.drawString(2*inch, height - 0.8*inch, "CENTRAL PHILIPPINES STATE UNIVERSITY")
    c.setFont("Helvetica", 10)
    c.drawString(2*inch, height - 1.0*inch, "University Health Services Clinic")
    c.setFont("Helvetica-Oblique", 9)
    c.drawString(2*inch, height - 1.15*inch, "Kabankalan City, Negros Occidental, Philippines")
    
    c.line(1*inch, height - 1.5*inch, width - 1*inch, height - 1.5*inch)
    
    # Title
    c.setFont("Helvetica-Bold", 16)
    c.drawCentredString(width/2, height - 2.2*inch, "MEDICAL EXCUSE SLIP")
    
    # Date and Recipient
    c.setFont("Helvetica", 11)
    text_y = height - 3*inch
    c.drawString(1*inch, text_y, f"Date Issued: {date.today().strftime('%B %d, %Y')}")
    text_y -= 0.6*inch
    c.setFont("Helvetica-Bold", 11)
    c.drawString(1*inch, text_y, "TO WHOM IT MAY CONCERN:")
    text_y -= 0.4*inch
    
    # Body Content
    c.setFont("Helvetica", 11)
    content = (
        f"This is to certify that {student.name}, with Student ID {student.school_id}, "
        f"has been under medical consultation and evaluation at the University Health Services Clinic. "
        f"Based on the clinical findings, the patient is recommended for medical excuse/leave "
        f"from {slip_in.start_date} to {slip_in.end_date}."
    )
    
    # Simple word wrap
    from reportlab.lib.utils import simpleSplit
    lines = simpleSplit(content, "Helvetica", 11, width - 2*inch)
    for line in lines:
        c.drawString(1*inch, text_y, line)
        text_y -= 0.25*inch
    
    text_y -= 0.3*inch
    c.setFont("Helvetica-Bold", 11)
    c.drawString(1*inch, text_y, "Reason for Excusal:")
    text_y -= 0.2*inch
    
    c.setFont("Helvetica", 11)
    reason_lines = simpleSplit(slip_in.reason, "Helvetica", 11, width - 2*inch)
    for line in reason_lines:
        c.drawString(1.2*inch, text_y, line)
        text_y -= 0.2*inch
        
    text_y -= 0.5*inch
    c.setFont("Helvetica-Oblique", 11)
    c.drawString(1*inch, text_y, "Recommendation: The student is advised to adhere to the prescribed rest and medication protocol (if any).")
    
    # Signature Aligned to the right
    text_y -= 1.5*inch
    sig_x = width - 4*inch
    c.setFont("Helvetica-Bold", 11)
    c.line(sig_x, text_y, width - 1*inch, text_y)
    c.drawCentredString(sig_x + 1.5*inch, text_y - 0.2*inch, f"DR. {issuer.name.upper()}")
    c.setFont("Helvetica", 10)
    c.drawCentredString(sig_x + 1.5*inch, text_y - 0.35*inch, "University Medical Officer / Clinic Staff")
    
    # Footer
    c.setFont("Helvetica", 8)
    c.drawCentredString(width/2, 0.5*inch, "This is an electronically generated medical document from the CPSU AI Virtual Health Assistant.")
    
    c.save()

@router.post("/", response_model=ExcuseSlipResponse)
async def create_excuse_slip(
    slip_in: ExcuseSlipCreate,
    current_user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db)
):
    if current_user.role not in ["staff", "admin"]:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Only staff can issue excuse slips"
        )
        
    student_result = await db.execute(select(User).where(User.id == slip_in.student_id))
    student = student_result.scalars().first()
    if not student:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Student not found")

    # Generate the PDF into a buffer
    buffer = io.BytesIO()
    generate_medical_slip(buffer, student, current_user, slip_in)
    buffer.name = "excuse_slip.pdf"
    buffer.seek(0)
    
    # Upload to Cloudinary
    try:
        cloudinary_url = cloudinary_upload(buffer, folder="excuse_slips", resource_type="image")
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Cloudinary upload failed: {str(e)}"
        )
    
    db_slip = ExcuseSlip(
        student_id=slip_in.student_id,
        issued_by_id=current_user.id,
        symptom_record_id=slip_in.symptom_record_id,
        file_path=cloudinary_url,
        start_date=slip_in.start_date,
        end_date=slip_in.end_date,
        reason=slip_in.reason
    )
    
    db.add(db_slip)
    
    # Notify student
    from ..utils.notifications import create_notification
    await create_notification(
        db,
        user_id=slip_in.student_id,
        title="Medical Excuse Slip Issued",
        message=f"A new medical excuse slip has been issued for the period {slip_in.start_date} to {slip_in.end_date}.",
        notification_type="document",
        link="/student/records"
    )
    
    await db.commit()
    await db.refresh(db_slip)
    
    return db_slip

@router.get("/", response_model=List[ExcuseSlipResponse])
async def list_excuse_slips(
    current_user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db)
):
    if current_user.role == "student":
        result = await db.execute(select(ExcuseSlip).where(ExcuseSlip.student_id == current_user.id))
    else:
        result = await db.execute(select(ExcuseSlip))
        
    return result.scalars().all()
