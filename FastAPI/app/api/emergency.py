from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy.future import select
from ..database import get_db
from ..models import EmergencyAlert, User
from ..schemas import EmergencyTrigger, EmergencyResponse, EmergencyUpdate
from ..auth import get_current_user
import uuid
from datetime import datetime
import pytz

router = APIRouter(prefix="/emergency", tags=["emergency"])

@router.post("/trigger", response_model=EmergencyResponse)
async def trigger_emergency(
    alert_in: EmergencyTrigger,
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    # Only students should trigger emergencies
    if current_user.role != "student":
        raise HTTPException(status_code=403, detail="Only students can trigger emergencies")

    # Prevent duplicate active emergency cases for a student.
    existing_active_result = await db.execute(
        select(EmergencyAlert).where(
            EmergencyAlert.student_id == current_user.id,
            EmergencyAlert.status == "active"
        )
    )
    existing_active = existing_active_result.scalars().first()
    if existing_active:
        raise HTTPException(
            status_code=409,
            detail="You already have an active emergency case. Please wait for clinic staff to resolve it."
        )

    db_alert = EmergencyAlert(
        student_id=current_user.id,
        location=alert_in.location,
        symptoms=alert_in.symptoms,
        description=alert_in.description,
        status="active",
        priority=100
    )
    
    db.add(db_alert)
    await db.commit()
    await db.refresh(db_alert)
    
    # Notify all staff members
    from ..utils.notifications import create_notification
    staff_result = await db.execute(select(User).where(User.role == "staff"))
    staff_members = staff_result.scalars().all()
    
    for staff in staff_members:
        await create_notification(
            db,
            user_id=staff.id,
            title="URGENT SOS ALERT",
            message=f"SOS distress signal from {current_user.name} at {alert_in.location}.",
            notification_type="emergency",
            link="/staff"
        )
    
    await db.commit()
    
    return db_alert

@router.get("/active", response_model=list[EmergencyResponse])
async def get_active_emergencies(
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    # Depending on role, returning different sets
    # Staff see all active, Students see only their own active
    query = select(EmergencyAlert).where(EmergencyAlert.status == "active")
    
    if current_user.role == "student":
        query = query.where(EmergencyAlert.student_id == current_user.id)
        
    result = await db.execute(query)
    return result.scalars().all()

@router.patch("/{emergency_id}", response_model=EmergencyResponse)
async def update_emergency(
    emergency_id: uuid.UUID,
    alert_update: EmergencyUpdate,
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    result = await db.execute(select(EmergencyAlert).where(EmergencyAlert.id == emergency_id))
    alert = result.scalars().first()

    if not alert:
        raise HTTPException(status_code=404, detail="Emergency alert not found")

    # Authorization: Only the student who created it or staff can update
    if current_user.role != "staff" and alert.student_id != current_user.id:
        raise HTTPException(status_code=403, detail="Not authorized to update this alert")

    if alert_update.location is not None:
        alert.location = alert_update.location
    if alert_update.status is not None:
        if current_user.role != "staff":
            raise HTTPException(status_code=403, detail="Only staff can update alert status")
        alert.status = alert_update.status

    await db.commit()
    await db.refresh(alert)
    return alert

@router.post("/{emergency_id}/resolve", response_model=EmergencyResponse)
async def resolve_emergency(
    emergency_id: uuid.UUID,
    notes: str = "",
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    if current_user.role != "staff" and not current_user.is_staff:
        raise HTTPException(status_code=403, detail="Only staff can resolve emergencies")
        
    result = await db.execute(select(EmergencyAlert).where(EmergencyAlert.id == emergency_id))
    alert = result.scalars().first()
    
    if not alert:
        raise HTTPException(status_code=404, detail="Emergency alert not found")
        
    alert.status = "resolved"
    alert.resolved_at = datetime.now(pytz.utc)
    alert.responded_by_id = current_user.id
    alert.resolution_notes = notes
    
    await db.commit()
    await db.refresh(alert)
    return alert
