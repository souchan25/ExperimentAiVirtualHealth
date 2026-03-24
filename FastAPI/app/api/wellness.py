from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy.future import select
from typing import List

from ..database import get_db
from ..models import User, WellnessCheckin
from ..schemas import WellnessCheckinResponse, WellnessCheckinCreate
from ..auth import get_current_user

router = APIRouter(prefix="/wellness", tags=["wellness"])

@router.get("/my", response_model=List[WellnessCheckinResponse])
async def get_my_wellness_history(
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    if current_user.role != "student":
        raise HTTPException(status_code=status.HTTP_403_FORBIDDEN, detail="Only students can view their wellness history")
        
    result = await db.execute(
        select(WellnessCheckin)
        .where(WellnessCheckin.student_id == current_user.id)
        .order_by(WellnessCheckin.created_at.desc())
    )
    return result.scalars().all()

@router.post("/", response_model=WellnessCheckinResponse)
async def create_wellness_checkin(
    checkin_in: WellnessCheckinCreate,
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    if current_user.role != "student":
        raise HTTPException(status_code=status.HTTP_403_FORBIDDEN, detail="Only students can submit wellness check-ins")
        
    db_checkin = WellnessCheckin(
        **checkin_in.model_dump(),
        student_id=current_user.id
    )
    db.add(db_checkin)
    await db.commit()
    await db.refresh(db_checkin)
    
    # Distress Detection & Automated Alerts
    # Check last 5 check-ins for persistent distress
    history_result = await db.execute(
        select(WellnessCheckin)
        .where(WellnessCheckin.student_id == current_user.id)
        .order_by(WellnessCheckin.created_at.desc())
        .limit(5)
    )
    recent_logs = history_result.scalars().all()
    
    if len(recent_logs) >= 3:
        distressed_moods = {"Stressed", "Sad", "Anxious"}
        distress_count = sum(1 for log in recent_logs if log.mood in distressed_moods)
        valid_stress = [log.stress_level for log in recent_logs if log.stress_level is not None]
        avg_stress = sum(valid_stress) / len(valid_stress) if valid_stress else 0
        
        if distress_count >= 3 or avg_stress > 7:
            from ..utils.notifications import create_notification
            await create_notification(
                db,
                user_id=current_user.id,
                title="Wellness Support Available",
                message="We've noticed you've been feeling under pressure lately. Remember that the university clinic is here to support you. Don't hesitate to reach out.",
                notification_type="Wellness",
                link="/student/records"
            )
            await db.commit()

    return db_checkin

@router.get("/student/{student_id}", response_model=List[WellnessCheckinResponse])
async def get_student_wellness_history(
    student_id: int,
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    if current_user.role not in ["staff", "admin"]:
        raise HTTPException(status_code=status.HTTP_403_FORBIDDEN, detail="Not authorized")
        
    result = await db.execute(
        select(WellnessCheckin)
        .where(WellnessCheckin.student_id == student_id)
        .order_by(WellnessCheckin.created_at.desc())
    )
    return result.scalars().all()
