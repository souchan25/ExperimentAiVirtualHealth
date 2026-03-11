from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy.future import select
from uuid import UUID
from ..database import get_db
from ..models import User, DepartmentStats, SymptomRecord
from ..auth import get_current_user

router = APIRouter(prefix="/staff", tags=["staff"])

@router.get("/dashboard")
async def get_dashboard(
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    if current_user.role != "staff":
        raise HTTPException(status_code=403, detail="Staff access only")
        
    # Aggregate data for dashboard
    # Performance Optimization: Use SQL COUNT directly to prevent loading all entities into memory
    from sqlalchemy import func
    users_result = await db.execute(select(func.count(User.id)).where(User.role == "student"))
    total_students = users_result.scalar() or 0
    
    symptoms_result = await db.execute(select(func.count(SymptomRecord.id)))
    total_symptoms = symptoms_result.scalar() or 0
    
    return {
        "total_students": total_students,
        "total_symptom_records": total_symptoms,
        # More aggregations here
    }
@router.get("/symptom-records")
async def get_all_symptom_records(
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    if current_user.role not in ["staff", "admin"]:
        raise HTTPException(status_code=403, detail="Staff access only")
        
    result = await db.execute(
        select(SymptomRecord, User.name.label("user_name"), User.school_id.label("school_id"))
        .join(User, SymptomRecord.student_id == User.id)
        .order_by(SymptomRecord.created_at.desc())
    )
    
    records = []
    for row in result.all():
        symptom_record = row[0]
        user_name = row[1]
        school_id = row[2]
        
        # Explicitly convert to dict to avoid SQLAlchemy state issues during serialization
        record_dict = {
            "id": str(symptom_record.id),
            "student_id": str(symptom_record.student_id),
            "symptoms": symptom_record.symptoms,
            "duration_days": symptom_record.duration_days,
            "severity": symptom_record.severity,
            "predicted_disease": symptom_record.predicted_disease,
            "final_diagnosis": symptom_record.final_diagnosis,
            "confidence_score": symptom_record.confidence_score,
            "status": symptom_record.status,
            "staff_notes": symptom_record.staff_notes,
            "created_at": symptom_record.created_at,
            "user_name": user_name,
            "school_id": school_id,
        }
        records.append(record_dict)
        
    return records

@router.patch("/symptom-records/{record_id}")
async def update_symptom_record_status(
    record_id: UUID,
    update_data: dict,
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    if current_user.role not in ["staff", "admin"]:
        raise HTTPException(status_code=403, detail="Staff access only")
        
    result = await db.execute(select(SymptomRecord).where(SymptomRecord.id == record_id))
    record = result.scalars().first()
    
    if not record:
        raise HTTPException(status_code=404, detail="Record not found")
        
    if "status" in update_data:
        record.status = update_data["status"]
    if "staff_notes" in update_data:
        record.staff_notes = update_data["staff_notes"]
    if "final_diagnosis" in update_data:
        record.final_diagnosis = update_data["final_diagnosis"]
        
    await db.commit()
    
    # Notify student
    from ..utils.notifications import create_notification
    await create_notification(
        db,
        user_id=record.student_id,
        title="Consultation Record Updated",
        message=f"Your consultation record for {record.predicted_disease} has been updated by the clinic staff.",
        notification_type="consultation",
        link="/student/records"
    )
    await db.commit()
    
    return {"status": "success"}
