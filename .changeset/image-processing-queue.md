---
"@sigle/sdk": patch
"@sigle/server": patch
---

Answer image uploads with a 503 and `Retry-After` when no image processing slot frees up within 5 seconds, instead of a 500 "Image processing timed out." after 10 seconds. The processing timeout now starts when the image gets its slot, so the time spent waiting no longer counts against it.
