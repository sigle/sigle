---
"@sigle/server": patch
"@sigle/sigle": patch
---

Make Railway traces easier to read: server request spans are named after their route (`GET /api/posts/:postId`) and SQL spans after their statement and table (`SELECT post`), and the job queue's polling no longer creates a trace every second. The post page loads the post once per request, and a missing post now shows the 404 page without reporting an error to Sentry. The website no longer shares one React Query cache between server requests, so each page render fetches its own data instead of reusing another visitor's.
