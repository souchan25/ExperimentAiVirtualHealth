## 2025-03-11 - Database Count Optimization
**Learning:** Found an anti-pattern where endpoints were fetching all records from the database just to count them in Python using `len(result.scalars().all())`. This is especially critical for `get_unread_count` because it's polled every 30 seconds by the frontend, meaning the payload and memory usage would grow linearly as the user's unread notifications scale.
**Action:** Use database-level `func.count(Model.id)` in SQLAlchemy queries whenever simply returning the total count of objects is needed, preventing full table loads into memory.
