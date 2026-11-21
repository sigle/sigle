---
"@sigle/server": minor
"@sigle/sdk": minor
"@sigle/sigle": patch
---

Return 201 from `POST /api/drafts/:draftId/images`, since every upload creates a new image. `PUT /api/me/profile` now returns `arweaveTxId` (was `id`), the signing `address`, and the stored `profile`, and the website updates its cached profile from that response instead of fetching it again.
