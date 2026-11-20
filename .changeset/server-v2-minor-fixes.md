---
"@sigle/server-v2": patch
"@sigle/sdk": patch
---

Expose the draft publish state as `publishStatus` on drafts and the draft list, send `draftId` instead of `postId` in the "draft created" PostHog event, apply the pixel limit when detecting an uploaded image's format, and add an index for the `GET /api/posts` order.
