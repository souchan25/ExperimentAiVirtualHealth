## 2024-03-11 - Database Dialect Hardcoding
**Vulnerability:** The messages API was hardcoded to use SQLite `rowid` for marking messages as read. This was a critical issue because when deploying to a PostgreSQL environment like Supabase, it would crash and not allow any messages to be marked as read.
**Learning:** The application is intended to run on both SQLite and PostgreSQL. Direct SQL queries using `text()` must be carefully evaluated to ensure dialect compatibility, avoiding engine-specific features unless wrapped in logic.
**Prevention:** Avoid SQLite-specific features like `rowid` in standard raw SQL queries. Use standard primary keys defined in the ORM model (like `id`).

## 2026-03-11 - Log Injection in Exception Handler
**Vulnerability:** Unsanitized user-controlled URL paths and system tracebacks were being written directly to a log file.
**Learning:** Attackers can inject newline characters into URL paths to forge log entries, potentially misleading administrators or hiding malicious activity.
**Prevention:** Always sanitize data written to logs. Replace newline (`\n`) and carriage return (`\r`) characters with escaped versions (`\\n`, `\\r`) when using unstructured logging.
