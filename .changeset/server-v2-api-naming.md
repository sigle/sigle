---
"@sigle/server": minor
"@sigle/sdk": minor
"@sigle/sigle": patch
---

Standardize the server-v2 API naming:

- Enum values are lowercase everywhere: draft `publishStatus`, the publish status (`pending`, `processing`, `completed`, `failed`) and the OpenTimestamps `status` (`pending`, `upgraded`, `failed`), like `plan` and the image `kind`.
- The publish status returns `arweaveTxId` instead of `arweaveId`.
- `POST /api/drafts/:draftId/publish` sets a `Location` header pointing to the publish status.
- Image upload responses drop the internal storage `key` and return `sizeBytes`.
- The admin failed-job routes take `:jobId`, and retrying a job returns 204 No Content.
- `GET /api/posts/:postId` exposes the OpenTimestamps `contentHash` and `bitcoinBlockHash`.
