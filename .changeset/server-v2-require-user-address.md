---
"@sigle/server": patch
---

Require every signed-in user to have a linked wallet address: authenticated requests fail when the user has none, and `address` on `/api/protected/me` and `author` on `GET /api/posts/:postId` are no longer nullable.
