## 2024-03-11 - Database Dialect Hardcoding
**Vulnerability:** The messages API was hardcoded to use SQLite `rowid` for marking messages as read. This was a critical issue because when deploying to a PostgreSQL environment like Supabase, it would crash and not allow any messages to be marked as read.
**Learning:** The application is intended to run on both SQLite and PostgreSQL. Direct SQL queries using `text()` must be carefully evaluated to ensure dialect compatibility, avoiding engine-specific features unless wrapped in logic.
**Prevention:** Avoid SQLite-specific features like `rowid` in standard raw SQL queries. Use standard primary keys defined in the ORM model (like `id`).
## 2025-02-27 - Insecure JSON Parsing via LLM Output
**Vulnerability:** Insecure and fragile extraction of JSON from LLM outputs using regular expressions that failed to properly handle varied markdown blocks and unexpected text, leading to failed extraction and potential application crashes or logic bypasses.
**Learning:** Depending entirely on `re.sub(r'```json\n?|\n?```', '', text)` is brittle because LLMs frequently format their output differently (e.g., surrounding text, differing whitespace, missing markdown tags).
**Prevention:** Implement a robust JSON extraction function that attempts direct parsing, safe markdown stripping (with `re.DOTALL`), and ultimately searching for the outermost JSON structure (using `text.find('{')` and `text.rfind('}')`) before utilizing `json.loads()`. Ensure graceful fallback to default values upon all parsing failures.
