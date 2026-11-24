---
"@sigle/server": patch
"@sigle/sdk": patch
"@sigle/sigle": patch
---

Let writers hide a published story from Sigle and show it again later. A hidden story leaves the profile, the RSS feed and the post list, and its page returns a 404, but it stays archived on Arweave with its Bitcoin timestamp. Add `GET /api/me/posts`, which lists the signed-in user's posts including hidden ones, and `PUT /api/me/posts/:postId/visibility`. The dashboard has a new Published page to manage them.
