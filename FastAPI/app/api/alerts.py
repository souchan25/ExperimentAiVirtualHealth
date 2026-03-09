from fastapi import APIRouter, Depends, HTTPException, status, Request
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy.future import select
from typing import List, Optional
from uuid import UUID
from datetime import datetime

from ..database import get_db
from ..models import User, CampusAlert
from ..schemas import CampusAlertResponse, CampusAlertCreate
from ..auth import get_current_user, get_optional_user

router = APIRouter(prefix="/alerts", tags=["alerts"])

@router.get("/", response_model=List[CampusAlertResponse])
async def get_active_alerts(
    db: AsyncSession = Depends(get_db),
    current_user: Optional[User] = Depends(get_optional_user)
):
    now = datetime.now()
    stmt = select(CampusAlert).where(
        CampusAlert.is_active == True,
        (CampusAlert.expires_at == None) | (CampusAlert.expires_at > now)
    )
    
    # Filter by target role if authenticated, otherwise return "all" alerts
    if current_user:
        if current_user.role == "student":
            stmt = stmt.where(CampusAlert.target_role.in_(["student", "all"]))
        elif current_user.role == "staff":
            stmt = stmt.where(CampusAlert.target_role.in_(["staff", "all"]))
        else:
            stmt = stmt.where(CampusAlert.target_role == "all")
    else:
        stmt = stmt.where(CampusAlert.target_role == "all")
        
    result = await db.execute(stmt.order_by(CampusAlert.created_at.desc()))
    return result.scalars().all()

@router.post("/", response_model=CampusAlertResponse)
async def create_alert(
    alert_in: CampusAlertCreate,
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    if current_user.role not in ["staff", "admin"]:
        raise HTTPException(status_code=403, detail="Not authorized")
        
    db_alert = CampusAlert(
        **alert_in.model_dump(),
        created_by_id=current_user.id
    )
    db.add(db_alert)
    await db.commit()
    await db.refresh(db_alert)
    return db_alert

@router.patch("/{alert_id}/deactivate")
async def deactivate_alert(
    alert_id: UUID,
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    if current_user.role not in ["staff", "admin"]:
        raise HTTPException(status_code=403, detail="Not authorized")
        
    result = await db.execute(select(CampusAlert).where(CampusAlert.id == alert_id))
    alert = result.scalars().first()
    if not alert:
        raise HTTPException(status_code=404, detail="Alert not found")
        
    alert.is_active = False
    await db.commit()
    return {"status": "success"}
