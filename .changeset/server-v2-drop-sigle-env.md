---
"@sigle/server": patch
---

Remove `SIGLE_ENV`. The deployment is named after its Stacks network, so Sentry, the startup log and the OpenAPI server description now use `STACKS_ENV`, and the server's Sentry events land in the same environment as the website's.
