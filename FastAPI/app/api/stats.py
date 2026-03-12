from fastapi import APIRouter, Depends
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import func, select
from ..database import get_db
from ..models import User, SymptomRecord, MedicalDocument, ChatSession, WellnessCheckin

router = APIRouter(prefix="/stats", tags=["stats"])

@router.get("/public")
async def get_public_stats(db: AsyncSession = Depends(get_db)):
    """
    Public endpoint — no auth required.
    Returns live counts used by the landing page Stats bar.
    """
    students = await db.scalar(
        select(func.count(User.id)).where(User.role == "student")
    )

    consultations = await db.scalar(
        select(func.count(SymptomRecord.id))
    )

    chat_sessions = await db.scalar(
        select(func.count(ChatSession.id))
    )

    records = await db.scalar(
        select(func.count(MedicalDocument.id))
    )

    wellness_checkins = await db.scalar(
        select(func.count(WellnessCheckin.id))
    )

    return {
        "students_served": students or 0,
        # combine symptom checker submissions + chat sessions as "AI consultations"
        "ai_consultations": (consultations or 0) + (chat_sessions or 0),
        "medical_records": records or 0,
        "wellness_checkins": wellness_checkins or 0,
    }
