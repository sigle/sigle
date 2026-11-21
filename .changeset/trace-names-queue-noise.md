---
"@sigle/server": patch
---

Make Railway traces easier to read: server request spans are named after their route (`GET /api/posts/:postId`) and SQL spans after their statement and table (`SELECT post`), and the job queue's polling no longer creates a trace every second.
