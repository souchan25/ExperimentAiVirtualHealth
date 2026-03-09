from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy.future import select
from typing import List
from ..database import get_db
from ..models import User, AuditLog
from ..schemas import AuditLogResponse
from ..auth import get_current_user

router = APIRouter(prefix="/audit", tags=["audit"])

@router.get("/", response_model=List[AuditLogResponse])
async def get_audit_logs(
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    if current_user.role != "admin":
        raise HTTPException(status_code=403, detail="Access denied")
        
    result = await db.execute(select(AuditLog).order_by(AuditLog.timestamp.desc()).limit(100))
    return result.scalars().all()

async def log_action(
    db: AsyncSession,
    user_id: str,
    action: str,
    model_name: str,
    object_id: str,
    changes: dict = {},
    success: bool = True,
    error_message: str = ""
):
    audit_log = AuditLog(
        user_id=user_id,
        action=action,
        model_name=model_name,
        object_id=object_id,
        changes=changes,
        success=success,
        error_message=error_message
    )
    db.add(audit_log)
    await db.commit()
