---
"@sigle/server": patch
"@sigle/sdk": patch
"@sigle/sigle": patch
---

Require `signature` in the post metadata of `POST /api/drafts/:draftId/publish`. The endpoint always rejected unsigned metadata with a 400, but the OpenAPI specification and the generated SDK marked the signature optional. The SDK's `PostMetadataSchema` keeps it optional, since metadata is built before the wallet signs it.
