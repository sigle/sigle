---
"@sigle/server-v2": patch
---

Send `Retry-After` on 429 responses, set the `x-ratelimit-*` headers on every response (errors and 429s included), and send `x-ratelimit-reset` as a Unix timestamp in seconds instead of seconds until the reset.
