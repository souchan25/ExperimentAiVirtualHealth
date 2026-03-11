## 2024-03-11 - Database Dialect Hardcoding
**Vulnerability:** The messages API was hardcoded to use SQLite `rowid` for marking messages as read. This was a critical issue because when deploying to a PostgreSQL environment like Supabase, it would crash and not allow any messages to be marked as read.
**Learning:** The application is intended to run on both SQLite and PostgreSQL. Direct SQL queries using `text()` must be carefully evaluated to ensure dialect compatibility, avoiding engine-specific features unless wrapped in logic.
**Prevention:** Avoid SQLite-specific features like `rowid` in standard raw SQL queries. Use standard primary keys defined in the ORM model (like `id`).

## 2024-05-20 - IDOR in Medication Log Endpoint
**Vulnerability:** Missing authorization check on `POST /medications/logs/{log_id}/taken` allowed any user to mark another user's medication log as taken.
**Learning:** `MedicationLog` query only filtered by `log_id` without verifying the associated `Medication.student_id` matched the `current_user.id`.
**Prevention:** Always verify ownership of resources before modifying them, using `.join()` to related tables if the ownership ID is not directly present on the model being modified.
