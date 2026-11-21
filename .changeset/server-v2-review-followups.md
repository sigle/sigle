---
"@sigle/server-v2": patch
"@sigle/sdk": patch
---

Accept `ipfs://` and `ar://` draft cover images and document draft URLs as `format: uri`, stop documenting a 400 response on endpoints without inputs, rename the profile update schemas to `UpdateProfilePayload` and `UpdateProfileResponse`, and expose the `Location`, `ETag`, `Retry-After` and `X-RateLimit-*` headers to the app over CORS.
