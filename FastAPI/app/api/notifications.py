from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy.future import select
from typing import List
from uuid import UUID

from ..database import get_db
from ..models import User, Notification
from ..schemas import NotificationResponse, NotificationCreate
from ..auth import get_current_user

router = APIRouter(prefix="/notifications", tags=["notifications"])


@router.get("/", response_model=List[NotificationResponse])
async def get_my_notifications(
    db: AsyncSession = Depends(get_db), current_user: User = Depends(get_current_user)
):
    result = await db.execute(
        select(Notification)
        .where(Notification.user_id == current_user.id)
        .order_by(Notification.created_at.desc())
    )
    return result.scalars().all()


@router.get("/unread/count")
async def get_unread_count(
    db: AsyncSession = Depends(get_db), current_user: User = Depends(get_current_user)
):
    # Performance Optimization: Use database-level COUNT instead of fetching all records
    # This endpoint is polled by the frontend every 30s, so minimizing DB transfer payload is crucial
    from sqlalchemy import func

    result = await db.execute(
        select(func.count(Notification.id)).where(
            Notification.user_id == current_user.id, Notification.is_read == False
        )
    )
    count = result.scalar() or 0
    return {"count": count}


@router.patch("/{notification_id}/read")
async def mark_notification_as_read(
    notification_id: UUID,
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    result = await db.execute(
        select(Notification).where(
            Notification.id == notification_id, Notification.user_id == current_user.id
        )
    )
    notification = result.scalars().first()
    if not notification:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND, detail="Notification not found"
        )

    notification.is_read = True
    await db.commit()
    return {"status": "success"}


@router.delete("/clear-all")
async def clear_all_notifications(
    db: AsyncSession = Depends(get_db), current_user: User = Depends(get_current_user)
):
    # Performance Optimization: Replaced N+1 manual deletes with a bulk delete
    # This prevents loading all objects into memory and sending O(N) queries to the database
    from sqlalchemy import delete

    await db.execute(
        delete(Notification).where(Notification.user_id == current_user.id)
    )

    await db.commit()
    return {"status": "success"}
