from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy.future import select
from sqlalchemy import text
from typing import List
from uuid import UUID
from ..database import get_db
from ..models import User, Message
from ..schemas import MessageCreate, MessageResponse
from ..auth import get_current_user

router = APIRouter(prefix="/messages", tags=["messages"])


def _normalize_id(value) -> str:
    if value is None:
        return ""
    if isinstance(value, UUID):
        return str(value)
    if isinstance(value, (bytes, bytearray)):
        try:
            if len(value) == 16:
                return str(UUID(bytes=bytes(value)))
            return value.decode("utf-8", errors="ignore")
        except Exception:
            return str(value)
    if isinstance(value, int):
        return str(value)
    text_value = str(value)
    try:
        return str(UUID(text_value))
    except Exception:
        return text_value

@router.get("/", response_model=List[MessageResponse])
async def get_messages(
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    uid = _normalize_id(current_user.id)

    users_result = await db.execute(select(User.id, User.name))
    user_map = {
        _normalize_id(row.id): row.name
        for row in users_result.all()
    }

    result = await db.execute(
        select(Message).order_by(Message.timestamp.asc())
    )

    rows = result.scalars().all()
    serialized = []
    for row in rows:
        sender_id = _normalize_id(row.sender_id)
        recipient_id = _normalize_id(row.recipient_id)
        if sender_id != uid and recipient_id != uid:
            continue

        serialized.append(
            {
                "id": _normalize_id(row.id),
                "sender_id": sender_id,
                "recipient_id": recipient_id,
                "sender_name": user_map.get(sender_id),
                "recipient_name": user_map.get(recipient_id),
                "content": row.content,
                "is_read": bool(row.is_read),
                "timestamp": row.timestamp,
            }
        )
    return serialized

@router.post("/", response_model=MessageResponse)
async def send_message(
    message_in: MessageCreate,
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    # Verify recipient exists to avoid IntegrityError
    recipient_result = await db.execute(select(User).where(User.id == message_in.recipient_id))
    recipient_user = recipient_result.scalars().first()
    
    if not recipient_user:
        # If dummy ID, try to find any staff member to receive it
        if str(message_in.recipient_id) == "00000000-0000-0000-0000-000000000000":
            staff_result = await db.execute(select(User).where(User.role == "staff"))
            recipient_user = staff_result.scalars().first()
            if not recipient_user:
                 raise HTTPException(status_code=404, detail="No clinic staff available to receive message")
        else:
            raise HTTPException(status_code=404, detail="Recipient not found")

    db_message = Message(
        sender_id=current_user.id,
        recipient_id=recipient_user.id,
        content=message_in.content
    )
    
    try:
        db.add(db_message)
        await db.commit()
        await db.refresh(db_message)
        
        # Notify recipient
        from ..utils.notifications import create_notification
        await create_notification(
            db,
            user_id=recipient_user.id,
            title="New Message Received",
            message=f"You have a new message from {current_user.name}.",
            notification_type="message",
            link="/student/messages" if recipient_user.role == "student" else "/staff/messages"
        )
        await db.commit()
    except Exception as e:
        await db.rollback()
        raise HTTPException(status_code=500, detail=f"Database error: {str(e)}")

    sender_result = await db.execute(select(User).where(User.id == current_user.id))
    sender_user = sender_result.scalars().first()

    return {
        "id": _normalize_id(db_message.id),
        "sender_id": _normalize_id(db_message.sender_id),
        "recipient_id": _normalize_id(db_message.recipient_id),
        "sender_name": sender_user.name if sender_user else None,
        "recipient_name": recipient_user.name if recipient_user else None,
        "content": db_message.content,
        "is_read": db_message.is_read,
        "timestamp": db_message.timestamp,
    }

@router.patch("/{message_id}/read")
async def mark_message_as_read(
    message_id: str,
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    uid = _normalize_id(current_user.id)
    result = await db.execute(
        select(Message.id, Message.recipient_id)
    )

    target_id = None
    for row in result.all():
        if _normalize_id(row.id) == str(message_id) and _normalize_id(row.recipient_id) == uid:
            target_id = row.id
            break

    if target_id is None:
        raise HTTPException(status_code=404, detail="Message not found")

    await db.execute(
        select(Message).where(Message.id == target_id)
    )
    # Perform the update
    message = await db.scalar(select(Message).where(Message.id == target_id))
    if message:
        message.is_read = True
        await db.commit()

    return {"status": "success"}
