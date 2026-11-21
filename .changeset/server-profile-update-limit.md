---
"@sigle/server": patch
"@sigle/sdk": patch
---

Limit profile updates to 10 per rolling 24 hours on every plan. `PUT /api/me/profile` returns a 429 with `Retry-After` past the limit, and `GET /api/me/limits` reports the usage as `profileUpdate`. The `PublishLimit` schema is renamed `DailyLimit`.
