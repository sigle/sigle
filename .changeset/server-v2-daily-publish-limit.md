---
"@sigle/server": patch
"@sigle/sdk": patch
---

Limit publishing to 3 posts per rolling 24 hours on the Free plan and 20 on the Pro plan, counting the posts published from a draft and the publishes in flight. Once the limit is reached, `POST /api/drafts/{draftId}/publish` returns a 429 with `Retry-After`. A failed plan lookup applies the Free limit. The new `GET /api/me/limits` returns the signed-in user's limits, starting with `publish` and its `limit`, `used` and `resetsAt`.
