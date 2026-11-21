---
"@sigle/server": minor
---

Store the server's data in SQLite (`node:sqlite`) instead of PostgreSQL, backed up continuously to R2 with Litestream when `LITESTREAM_BUCKET` is set. The database file is set with `DATABASE_PATH`, replacing `DATABASE_KIND` and `DATABASE_URL`. Migrations restart from a single init migration. Rate limits are kept in memory instead of the database.
