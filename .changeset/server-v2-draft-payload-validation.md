---
"@sigle/server": patch
"@sigle/sdk": patch
---

Validate draft payloads: cap the length of the title, content, meta fields and tags (at most 5, up to 50 characters each), require `coverImage` and `canonicalUri` to be http(s) URLs, clear tags with `[]` instead of `null` on update, and stop an empty PATCH from bumping `updatedAt`.
