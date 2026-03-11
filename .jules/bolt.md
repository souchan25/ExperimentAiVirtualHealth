## 2025-03-11 - Database Count Optimization
**Learning:** Found an anti-pattern where endpoints were fetching all records from the database just to count them in Python using `len(result.scalars().all())`. This is especially critical for `get_unread_count` because it's polled every 30 seconds by the frontend, meaning the payload and memory usage would grow linearly as the user's unread notifications scale.
**Action:** Use database-level `func.count(Model.id)` in SQLAlchemy queries whenever simply returning the total count of objects is needed, preventing full table loads into memory.

## 2024-03-11 - Bulk Delete Optimization for Notifications
**Learning:** Fetching records into memory simply to loop through and delete them one by one results in N+1 database queries, high memory overhead, and severe performance degradation. A benchmark deleting 1000 notifications showed a 93% performance penalty compared to bulk deletion (0.0525s vs 0.0035s).
**Action:** Replaced the loop-based manual `delete` in `api/notifications.py` with SQLAlchemy's native `delete().where()` construct. This allows the database to handle the operation efficiently via a single query, significantly reducing execution time and network round-trips.
