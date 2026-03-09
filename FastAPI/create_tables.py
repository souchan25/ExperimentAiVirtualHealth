import asyncio
from app.database import engine, Base
import app.models

async def init_db():
    """Create tables that don't exist yet (safe for production - never drops)."""
    async with engine.begin() as conn:
        await conn.run_sync(Base.metadata.create_all)
    print("Database tables synced successfully (new tables created, existing tables untouched)")

if __name__ == "__main__":
    asyncio.run(init_db())
