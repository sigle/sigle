---
"@sigle/sdk": minor
"@sigle/server-v2": patch
---

Rename the signature verifier to `verifyMetadataSignature` (with a deprecated `verifyPostSignature` alias), and add the server-v2 profile store: persist signed profile metadata on upload to Arweave (skipping no-op saves), reference the signing wallet, and expose `GET /api/users/:username` with `Cache-Control`/`ETag` headers to read a public profile by Stacks address.
