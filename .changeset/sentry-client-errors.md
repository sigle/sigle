---
"@sigle/server": patch
---

Stop reporting client errors to Sentry. Every 4xx API error (400, 401, 403, 404, 409, 413, 415, 429) was sent to Sentry, including the 401 of each signed-out visitor and each rate-limited request, because the reporter's 401/404/422 filter never matched them. They are now marked ignored like Effect's own HTTP API errors; 5xx errors are still reported.
