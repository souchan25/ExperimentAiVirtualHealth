from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy.future import select
from sqlalchemy import text, or_, and_
from typing import List
from uuid import UUID
from ..database import get_db
from ..models import User, Message
from ..schemas import MessageCreate, MessageResponse, ConversationResponse
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

@router.get("/", response_model=List[ConversationResponse])
async def get_conversations(
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    """
    Get unique conversations for the current user, showing the last message for each.
    """
    # This query groups messages by the other person in the conversation
    # and picks the latest message for each.
    # Note: SQLite/Postgres grouping can be tricky with 'latest'. Using a subquery.
    
    result = await db.execute(
        select(Message)
        .where(or_(Message.sender_id == current_user.id, Message.recipient_id == current_user.id))
        .order_by(Message.timestamp.desc())
    )
    all_messages = result.scalars().all()
    
    # Simple in-memory grouping for the prototype/migration
    conversations_map = {}
    
    # Get all potential user IDs for names
    user_ids = set()
    for msg in all_messages:
        user_ids.add(msg.sender_id)
        user_ids.add(msg.recipient_id)
    
    users_result = await db.execute(select(User.id, User.name).where(User.id.in_(user_ids)))
    user_names = {row.id: row.name for row in users_result.all()}

    for msg in all_messages:
        other_user_id = msg.recipient_id if msg.sender_id == current_user.id else msg.sender_id
        
        if other_user_id not in conversations_map:
            conversations_map[other_user_id] = {
                "id": str(other_user_id),
                "contact_name": user_names.get(other_user_id, "Unknown"),
                "last_message": msg.content,
                "last_message_time": msg.timestamp.strftime("%I:%M %p") if msg.timestamp else "",
                "unread_count": 0, # Could be calculated
                "timestamp": msg.timestamp
            }
        
        if not msg.is_read and msg.recipient_id == current_user.id:
            conversations_map[other_user_id]["unread_count"] += 1

    return list(conversations_map.values())

@router.get("/{other_user_id}", response_model=List[MessageResponse])
async def get_conversation_messages(
    other_user_id: int,
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    """
    Get full message history between current user and another user.
    """
    result = await db.execute(
        select(Message)
        .where(
            or_(
                and_(Message.sender_id == current_user.id, Message.recipient_id == other_user_id),
                and_(Message.sender_id == other_user_id, Message.recipient_id == current_user.id)
            )
        )
        .order_by(Message.timestamp.asc())
    )
    
    rows = result.scalars().all()
    serialized = []
    for row in rows:
        serialized.append({
            "id": _normalize_id(row.id),
            "sender_id": row.sender_id,
            "recipient_id": row.recipient_id,
            "content": row.content,
            "is_read": bool(row.is_read),
            "timestamp": row.timestamp,
        })
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
    # Try to parse message_id as UUID if it's stored as UUID in DB
    try:
        msg_uuid = UUID(message_id)
    except ValueError:
        msg_uuid = message_id

    # Filter by ID and recipient directly in the query
    result = await db.execute(
        select(Message).where(
            Message.id == msg_uuid,
            Message.recipient_id == current_user.id
        )
    )
    message = result.scalars().first()

    if not message:
        raise HTTPException(status_code=404, detail="Message not found")

    message.is_read = True
    await db.commit()

    return {"status": "success"}
