---
"@sigle/sdk": patch
"@sigle/sigle": patch
---

Point the website at the server-v2 API: regenerate the SDK for the server-v2 endpoints, migrate drafts CRUD to `/api/protected/drafts`, publish drafts through the new queue-backed `/api/protected/drafts/{draftId}/publish` endpoints, update the SIWS login flow (sign-in-with-stacks 0.4.0, better-auth 1.7.6) with whitelist status read from `/api/protected/me`, and migrate profile metadata and avatar/cover uploads to the new `/api/protected/user/profile` routes.
