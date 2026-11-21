---
"@sigle/server": patch
"@sigle/sdk": minor
---

Complete the server-v2 OpenAPI document:

- The admin queue routes are excluded from `/_openapi.json` and the SDK, since they are internal.
- Every operation has a summary and a description, and every path and query parameter has a description. `limit` and `offset` document their defaults (20 and 0).
- Counts, sizes, dimensions, and block heights are documented as non-negative integers, and `retryAfterMillis` on a 429 is an integer.
- `POST /api/drafts/:draftId/images` no longer lists the 429 and 500 errors itself, the rate limit middleware already adds them.
- The API description explains the Better Auth sign-in routes under `/api/auth`.
