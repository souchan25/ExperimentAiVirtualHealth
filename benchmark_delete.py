import asyncio
import time
from sqlalchemy.ext.asyncio import create_async_engine, AsyncSession
from sqlalchemy.orm import sessionmaker
from sqlalchemy import Column, Integer, String, Boolean, ForeignKey
from sqlalchemy.orm import declarative_base
from sqlalchemy.future import select

Base = declarative_base()

class User(Base):
    __tablename__ = 'users'
    id = Column(Integer, primary_key=True, autoincrement=True)

class Notification(Base):
    __tablename__ = 'notifications'
    id = Column(Integer, primary_key=True, autoincrement=True)
    user_id = Column(Integer, ForeignKey('users.id'))
    is_read = Column(Boolean, default=False)

async def setup_db(engine):
    async with engine.begin() as conn:
        await conn.run_sync(Base.metadata.drop_all)
        await conn.run_sync(Base.metadata.create_all)

async def seed_data(session_factory, user_id, count):
    async with session_factory() as session:
        session.add(User(id=user_id))
        for _ in range(count):
            session.add(Notification(user_id=user_id))
        await session.commit()

async def manual_delete(session_factory, user_id):
    async with session_factory() as session:
        result = await session.execute(
            select(Notification).where(Notification.user_id == user_id)
        )
        notifications = result.scalars().all()
        for n in notifications:
            await session.delete(n)
        await session.commit()

async def bulk_delete(session_factory, user_id):
    from sqlalchemy import delete
    async with session_factory() as session:
        await session.execute(
            delete(Notification).where(Notification.user_id == user_id)
        )
        await session.commit()

async def run_benchmark():
    engine = create_async_engine("sqlite+aiosqlite:///:memory:")
    session_factory = sessionmaker(engine, class_=AsyncSession, expire_on_commit=False)

    count = 1000
    print(f"Benchmarking with {count} notifications...")

    # Measure manual delete
    await setup_db(engine)
    await seed_data(session_factory, 1, count)

    start_time = time.perf_counter()
    await manual_delete(session_factory, 1)
    manual_duration = time.perf_counter() - start_time
    print(f"Manual loop delete (N+1): {manual_duration:.4f} seconds")

    # Measure bulk delete
    await setup_db(engine)
    await seed_data(session_factory, 2, count)

    start_time = time.perf_counter()
    await bulk_delete(session_factory, 2)
    bulk_duration = time.perf_counter() - start_time
    print(f"Bulk delete: {bulk_duration:.4f} seconds")

    improvement = (manual_duration - bulk_duration) / manual_duration * 100
    print(f"Improvement: {improvement:.2f}%")

if __name__ == "__main__":
    asyncio.run(run_benchmark())
