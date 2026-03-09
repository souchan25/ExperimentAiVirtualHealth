from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy.future import select
from typing import List
from ..database import get_db
from ..models import User, Appointment
from ..schemas import AppointmentCreate, AppointmentResponse
from ..auth import get_current_user

router = APIRouter(prefix="/appointments", tags=["appointments"])

@router.get("/", response_model=List[AppointmentResponse])
async def get_appointments(
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    if current_user.role == "student":
        result = await db.execute(select(Appointment).where(Appointment.student_id == current_user.id))
    else:
        result = await db.execute(select(Appointment).order_by(Appointment.scheduled_date.asc()))
        
    return result.scalars().all()

@router.post("/", response_model=AppointmentResponse)
async def create_appointment(
    appointment_in: AppointmentCreate,
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    if current_user.role != "student":
        raise HTTPException(status_code=403, detail="Only students can request appointments")
        
    db_appointment = Appointment(
        student_id=current_user.id,
        **appointment_in.model_dump()
    )
    
    db.add(db_appointment)
    await db.commit()
    await db.refresh(db_appointment)
    return db_appointment

@router.patch("/{appointment_id}", response_model=AppointmentResponse)
async def update_appointment_status(
    appointment_id: str,
    status: str,
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    result = await db.execute(select(Appointment).where(Appointment.id == appointment_id))
    appointment = result.scalars().first()
    
    if not appointment:
        raise HTTPException(status_code=404, detail="Appointment not found")
        
    if current_user.role == "student" and status != "cancelled":
        raise HTTPException(status_code=403, detail="Students can only cancel their appointments")
        
    appointment.status = status
    if current_user.role == "staff" or current_user.role == "admin":
        appointment.staff_id = current_user.id
        
    await db.commit()
    await db.refresh(appointment)
    return appointment
