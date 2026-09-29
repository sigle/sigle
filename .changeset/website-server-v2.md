---
"@sigle/sdk": patch
"@sigle/sigle": patch
---

Point the website at the server-v2 API: regenerate the SDK for the server-v2 endpoints, migrate drafts CRUD to `/api/protected/drafts`, and update the SIWS login flow (sign-in-with-stacks 0.4.0, better-auth 1.7.6) with whitelist status read from `/api/protected/me`.
