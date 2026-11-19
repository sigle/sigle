---
"@sigle/server-v2": patch
---

Add Pro-only draft image uploads: `PUT /api/protected/drafts/:draftId/images` re-encodes the image as WebP (up to 5 MiB), stores it in R2 under a content-hashed key and records its ThumbHash placeholder. Free users get a 403. `GET /api/protected/me` now returns the user's `plan`.
