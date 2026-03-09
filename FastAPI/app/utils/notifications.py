from sqlalchemy.ext.asyncio import AsyncSession
from ..models import Notification

async def create_notification(
    db: AsyncSession,
    user_id: int,
    title: str,
    message: str,
    notification_type: str = "info",
    link: str = None
):
    """
    Creates a notification for a user.
    """
    notification = Notification(
        user_id=user_id,
        title=title,
        message=message,
        notification_type=notification_type,
        link=link,
        is_read=False
    )
    db.add(notification)
    return notification
