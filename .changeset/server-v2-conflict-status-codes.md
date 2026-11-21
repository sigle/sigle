---
"@sigle/server": patch
"@sigle/sdk": patch
---

Return 409 Conflict instead of 400 when a draft publish or a profile metadata upload reuses an already published signature, and 404 instead of 400 from `GET /api/protected/drafts/:draftId/publish` when the draft has never been published.
