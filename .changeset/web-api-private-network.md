---
"@sigle/sigle": patch
"@sigle/server": patch
---

Call the API over Railway's private network when rendering pages, and don't rate limit GET requests that come over it. Before, every server-side call came through the public edge from the website's egress IP, so all visitors shared one limit of 60 requests a minute per endpoint, and a busy minute could make pages fail.
