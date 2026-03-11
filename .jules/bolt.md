## 2025-03-11 - Database Count Optimization
**Learning:** Found an anti-pattern where endpoints were fetching all records from the database just to count them in Python using `len(result.scalars().all())`. This is especially critical for `get_unread_count` because it's polled every 30 seconds by the frontend, meaning the payload and memory usage would grow linearly as the user's unread notifications scale.
**Action:** Use database-level `func.count(Model.id)` in SQLAlchemy queries whenever simply returning the total count of objects is needed, preventing full table loads into memory.

## 2025-03-11 - Bulk query execution over in-loop db calls
**Learning:** Found N+1 query issue where `func.count` and `.where` were executed dynamically in a `for loop` across all departments. This slows down execution significantly. Using SQLAlchemy's `group_by` and aggregating outside the loop transforms `O(N)` queries to `O(1)`.
**Action:** Replaced looped db queries with 4 separate `group_by` db executions, storing results in python dictionaries, and fetching from them inside the loop. Reduced execution time from ~0.1095s to ~0.0468s per API call.
