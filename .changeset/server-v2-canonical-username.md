---
"@sigle/server": patch
---

`GET /api/users/:username` reads non-canonical spellings of a Stacks address, such as `O` for `0`, like `GET /api/posts?username=` already did, and returns the canonical address.
