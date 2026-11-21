---
"@sigle/sigle": patch
---

Keep Sentry out of the website's Railway traces: the server no longer sends a release health session for every request, and calls to Sentry are no longer traced.
