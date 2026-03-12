from fastapi import APIRouter, Depends, HTTPException, Body
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy.future import select
from ..database import get_db
from ..models import ChatSession, HealthInsight, User
from ..schemas import ChatSessionCreate, ChatSessionResponse, ChatMessage, HealthInsightResponse
from ..auth import get_current_user
from ..services.llm import ai_generator
import uuid
from datetime import datetime
import pytz

router = APIRouter(prefix="/chat", tags=["chat"])

@router.post("/start", response_model=ChatSessionResponse)
async def start_chat(
    session_in: ChatSessionCreate,
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    new_session = ChatSession(
        student_id=current_user.id,
        language=session_in.language,
        started_at=datetime.now(pytz.utc)
    )
    
    db.add(new_session)
    await db.commit()
    await db.refresh(new_session)
    return new_session

@router.post("/message")
async def send_message(
    msg_in: ChatMessage,
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    # Retrieve the session if provided
    session = None
    language = "english"
    if msg_in.session_id:
        result = await db.execute(select(ChatSession).where(ChatSession.id == msg_in.session_id))
        session = result.scalars().first()
        if session and session.student_id != current_user.id:
            raise HTTPException(status_code=403, detail="Not your session")
        if session:
            language = session.language or "english"
            
    # Generate LLM Response
    try:
        response_text = await ai_generator.generate_chat_response(
            msg_in.message,
            language=language,
            history=msg_in.history,
        )
    except Exception as e:
        print(f"Error calling AI generator: {e}")
        response_text = f"I'm sorry, I encountered an error: {str(e)}"
    
    return {
        "reply": response_text or "I'm sorry, I couldn't generate a response.",
        "session_id": str(session.id) if session else None
    }

@router.post("/system")
async def send_system_message(
    msg_in: ChatMessage,
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    try:
        response_text = await ai_generator.generate_system_response(
            message=msg_in.message,
            role=current_user.role,
            target="mistral",
            history=msg_in.history
        )
    except Exception as e:
        print(f"Error calling AI generator for system message: {e}")
        response_text = f"I'm sorry, I encountered an error: {str(e)}"
        
    return {
        "reply": response_text
    }

@router.post("/end")
async def end_chat(
    session_id: uuid.UUID,
    history: list | None = Body(None),
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    from ..models import SymptomRecord
    from ..services.ml import ml_predictor
    
    result = await db.execute(select(ChatSession).where(ChatSession.id == session_id))
    session = result.scalars().first()
    
    if not session or session.student_id != current_user.id:
        raise HTTPException(status_code=404, detail="Session not found")
        
    session.ended_at = datetime.now(pytz.utc)
    
    # Process history for clinic data if provided
    if history:
        try:
            clinical_data = await ai_generator.extract_clinical_data(history)
            symptoms = clinical_data.get("symptoms", [])
            
            # Additional fallback to regex if AI returns empty but history has content
            if not symptoms:
                from ..services.llm import _extract_symptoms_from_history
                symptoms = _extract_symptoms_from_history(history)
            
            if symptoms:
                # Get prediction for current symptoms
                prediction = ml_predictor.predict(symptoms)
                ml_disease = prediction.get("predicted_disease", "Unknown")
                ml_conf = prediction.get("confidence_score", 0.0)
                
                # Refine prediction with LLM
                refined = await ai_generator.refine_diagnosis(symptoms, ml_disease, ml_conf)
                
                db_symptom = SymptomRecord(
                    student_id=current_user.id,
                    symptoms=symptoms,
                    duration_days=clinical_data.get("duration_days", 1),
                    severity=clinical_data.get("severity", 1),
                    predicted_disease=refined["refined_disease"],
                    confidence_score=refined["refined_confidence"],
                    top_predictions=prediction.get("top_predictions", []),
                    status="under_review",
                    is_acute=True
                )
                db.add(db_symptom)
                print(f"DEBUG: Created SymptomRecord for user {current_user.id} with symptoms {symptoms}")
            else:
                print(f"DEBUG: No symptoms extracted for user {current_user.id} session {session_id}")
        except Exception as e:
            print(f"ERROR: Failed to process clinical data for session {session_id}: {e}")
            
    await db.commit()
    return {"status": "ended"}

