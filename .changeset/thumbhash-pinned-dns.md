---
"@sigle/server": patch
---

Download cover images for thumbhashes with Effect's Undici HTTP client, whose DNS lookup refuses a hostname that resolves to a private or reserved network and pins the connection to the address it checked, so such a hostname is refused when connecting, not only when it is written as an IP address.
