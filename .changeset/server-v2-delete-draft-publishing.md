---
"@sigle/server": patch
"@sigle/sdk": patch
---

Reject `DELETE /api/protected/drafts/:draftId` with a 409 while the draft is being published, so a deletion can no longer orphan its Arweave upload.
