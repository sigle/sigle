---
"@sigle/server": patch
"@sigle/sdk": patch
---

Limit publishing to 3 posts per rolling 24 hours on the Free plan and 20 on the Pro plan, counting the posts published from a draft. Once the limit is reached, `POST /api/drafts/{draftId}/publish` returns a 429 with `Retry-After`. A failed plan lookup applies the Free limit. `GET /api/me` returns the user's `publishLimit` with `limit`, `used` and `resetsAt`.
