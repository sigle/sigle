---
"@sigle/server-v2": minor
"@sigle/sdk": minor
"@sigle/sigle": patch
---

Reorganize the server-v2 API routes without the `/protected` prefix: `GET /api/me`, `PUT /api/me/profile` (was `POST /api/protected/user/profile/upload-metadata`), `PUT /api/me/profile/images/:kind`, `/api/drafts/...` with `POST /api/drafts/:draftId/images` (was `PUT`), `/api/admin/...`, `GET /api/users/:address`, and `GET /api/posts?author=` (was `?username=`). The `protected` OpenAPI tag is now `me`. The website uses the new routes.
