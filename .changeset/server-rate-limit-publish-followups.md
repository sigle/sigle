---
"@sigle/server": patch
"@sigle/sdk": patch
---

Rate limit the Better Auth routes per IP and policy instead of per path, so made-up `/api/auth/*` paths no longer each get a fresh limit. A publish with another signature now also returns a 409 while the worker that uploaded the draft's metadata is creating the post, instead of discarding that paid Arweave upload. The OpenAPI document lists the `ETag` header of public reads, and the testnet server reads the client IP from `X-Real-IP`.
