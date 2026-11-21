---
"@sigle/server-v2": patch
"@sigle/sdk": patch
---

Rate limit unauthenticated clients by the IP header set by the proxy (`CLIENT_IP_HEADER`), limit the Better Auth routes per IP, limit draft publishing to 4 per minute, and stop rate limiting `/health`. Upload identical profile metadata to Arweave once under concurrent requests, return a 409 instead of discarding a draft's in-flight Arweave upload for another signature, and time out Arweave uploads after 60 seconds. Public reads of users and posts carry `Cache-Control` and an `ETag` and answer a matching `If-None-Match` with a 304.
