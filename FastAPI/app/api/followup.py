from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy.future import select
from ..database import get_db
from ..models import FollowUp, User
from ..schemas import FollowUpResponse
from ..auth import get_current_user
import uuid

router = APIRouter(prefix="/followups", tags=["followups"])

@router.get("/", response_model=list[FollowUpResponse])
async def get_followups(
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    query = select(FollowUp)
    if current_user.role == "student":
        query = query.where(FollowUp.student_id == current_user.id)
        
    result = await db.execute(query)
    return result.scalars().all()

@router.post("/{followup_id}/respond", response_model=FollowUpResponse)
async def respond_to_followup(
    followup_id: uuid.UUID,
    outcome: str,
    notes: str = "",
    still_experiencing: bool = False,
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    from datetime import datetime
    import pytz
    
    result = await db.execute(select(FollowUp).where(FollowUp.id == followup_id))
    followup = result.scalars().first()
    
    if not followup or followup.student_id != current_user.id:
        raise HTTPException(status_code=404, detail="Follow-up not found")
        
    followup.status = "completed"
    followup.response_date = datetime.now(pytz.utc)
    followup.outcome = outcome
    followup.notes = notes
    followup.still_experiencing_symptoms = still_experiencing
    
    await db.commit()
    await db.refresh(followup)
    return followup
