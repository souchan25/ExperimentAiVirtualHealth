## 2024-03-11 - Database Dialect Hardcoding
**Vulnerability:** The messages API was hardcoded to use SQLite `rowid` for marking messages as read. This was a critical issue because when deploying to a PostgreSQL environment like Supabase, it would crash and not allow any messages to be marked as read.
**Learning:** The application is intended to run on both SQLite and PostgreSQL. Direct SQL queries using `text()` must be carefully evaluated to ensure dialect compatibility, avoiding engine-specific features unless wrapped in logic.
**Prevention:** Avoid SQLite-specific features like `rowid` in standard raw SQL queries. Use standard primary keys defined in the ORM model (like `id`).
## 2025-02-17 - Hardcoded Absolute File Path (Information Exposure & Path Brittleness)
**Vulnerability:** Hardcoded absolute file path `d:/Expiremental/Assets/cpsu-logo.png` found in `FastAPI/app/api/excuse_slips.py` and `FastAPI/app/api/reports.py`.
**Learning:** Hardcoding absolute paths tied to a specific developer's machine not only breaks functionality when deployed to other environments but also exposes the internal directory structure (e.g., drive letters, project folders) of the system it was developed on, which is a form of information exposure.
**Prevention:** Always use dynamic, relative path resolution using `__file__` (e.g., `os.path.abspath(os.path.join(os.path.dirname(__file__), "..", "..", "..", "Assets"))`) or leverage environment variables for configuration paths to ensure portability and security across different deployment environments.
