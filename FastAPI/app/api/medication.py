from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy.future import select
from ..database import get_db
from ..models import Medication, User, MedicationLog, InventoryItem, StockTransaction
from ..schemas import MedicationCreate, MedicationResponse
from ..auth import get_current_user
import uuid

router = APIRouter(prefix="/medications", tags=["medications"])

@router.get("/", response_model=list[MedicationResponse])
async def get_medications(
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    query = select(Medication).where(Medication.student_id == current_user.id)
    result = await db.execute(query)
    return result.scalars().all()

@router.post("/create", response_model=MedicationResponse)
async def create_medication(
    med_in: MedicationCreate,
    student_id: int,
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    if current_user.role != "staff":
        raise HTTPException(status_code=403, detail="Only staff can prescribe medication")
        
    # Check for inventory item and deduct stock if it exists
    inventory_result = await db.execute(select(InventoryItem).where(InventoryItem.name == med_in.name))
    inventory_item = inventory_result.scalars().first()
    
    if inventory_item:
        if inventory_item.current_stock < 1:
            # We still allow prescription but maybe log or alert?
            # For now, let's just deduct if possible.
            pass
        else:
            inventory_item.current_stock -= 1  # Standard deduction per prescription
            
            # Create a stock transaction record
            db_trans = StockTransaction(
                item_id=inventory_item.id,
                user_id=current_user.id,
                transaction_type="deduction",
                quantity=1,
                source="Prescription",
                notes=f"Auto-deducted for prescription to student {student_id}"
            )
            db.add(db_trans)

    db_med = Medication(
        student_id=student_id,
        prescribed_by_id=current_user.id,
        name=med_in.name,
        dosage=med_in.dosage,
        frequency=med_in.frequency,
        schedule_times=med_in.schedule_times,
        start_date=med_in.start_date,
        end_date=med_in.end_date,
        instructions=med_in.instructions,
        purpose=med_in.purpose,
        symptom_record_id=med_in.symptom_record_id
    )
    
    db.add(db_med)
    
    # Commit changes
    await db.commit()
    await db.refresh(db_med)

    # Notify student (Background task could be better, but since it's an internal fast function, we keep it as is, or you can use BackgroundTasks)
    from ..utils.notifications import create_notification
    # We await it since it just inserts to DB, but normally email sending would be backgrounded.
    await create_notification(
        db,
        user_id=student_id,
        title="New Prescription Issued",
        message=f"A new prescription for {med_in.name} has been added to your pillbox.",
        notification_type="medication",
        link="/student/medications"
    )
    
    return db_med

@router.post("/logs/{log_id}/taken")
async def mark_log_taken(
    log_id: uuid.UUID,
    notes: str = "",
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    from datetime import datetime
    import pytz
    
    result = await db.execute(select(MedicationLog).where(MedicationLog.id == log_id))
    log = result.scalars().first()
    if not log:
        raise HTTPException(status_code=404, detail="Log not found")
        
    # Validation omitted for brevity...
    log.status = "taken"
    log.taken_at = datetime.now(pytz.utc)
    log.notes = notes
    
    await db.commit()
    return {"status": "taken"}
