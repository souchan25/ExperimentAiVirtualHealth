## 2024-03-11 - Database Dialect Hardcoding
**Vulnerability:** The messages API was hardcoded to use SQLite `rowid` for marking messages as read. This was a critical issue because when deploying to a PostgreSQL environment like Supabase, it would crash and not allow any messages to be marked as read.
**Learning:** The application is intended to run on both SQLite and PostgreSQL. Direct SQL queries using `text()` must be carefully evaluated to ensure dialect compatibility, avoiding engine-specific features unless wrapped in logic.
**Prevention:** Avoid SQLite-specific features like `rowid` in standard raw SQL queries. Use standard primary keys defined in the ORM model (like `id`).
## 2024-03-11 - Hardcoded Default Secret Key
**Vulnerability:** The FastAPI `Settings` class used a hardcoded string `your-super-secret-key-here-change-this-in-production` as the default `SECRET_KEY` for signing JWT tokens.
**Learning:** Hardcoding secrets as fallback defaults creates a critical vulnerability if developers deploy without setting the environment variable, as attackers can trivially forge valid JWT tokens.
**Prevention:** Use `secrets.token_urlsafe(32)` inside a Pydantic `Field(default_factory=...)` to dynamically generate a cryptographically secure key upon startup if one isn't provided, ensuring safety even if `.env` configuration is forgotten.
