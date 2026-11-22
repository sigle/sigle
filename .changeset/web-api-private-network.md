---
"@sigle/sigle": patch
---

Call the API over Railway's private network when rendering pages, and forward each visitor's IP in `X-Real-IP`. The API's rate limits apply per visitor again: before, every server-side call came from the website's public egress IP, so all visitors shared one limit of 60 requests a minute per endpoint.
