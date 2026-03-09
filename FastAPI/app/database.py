from sqlalchemy.ext.asyncio import create_async_engine, AsyncSession, async_sessionmaker
from sqlalchemy.orm import DeclarativeBase
from .config import settings

# Engine configuration based on database type
engine_args = {"echo": settings.DEBUG}

if settings.USE_SQLITE:
    # SQLite specific arguments
    engine_args["connect_args"] = {"check_same_thread": False}
else:
    # PostgreSQL specific arguments (Supabase)
    engine_args.update({
        "pool_size": 20,
        "max_overflow": 10,
        "pool_recycle": 1800,
        "pool_pre_ping": True,
    })

engine = create_async_engine(
    settings.DATABASE_URL,
    **engine_args
)

# Async session factory
AsyncSessionLocal = async_sessionmaker(
    bind=engine,
    class_=AsyncSession,
    expire_on_commit=False,
)

# Base class for models
class Base(DeclarativeBase):
    pass

# Dependency to get db session
async def get_db():
    async with AsyncSessionLocal() as session:
        yield session
