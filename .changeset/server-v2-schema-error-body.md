---
"@sigle/server": patch
"@sigle/sdk": patch
---

Return a `BadRequest` body (`{ _tag, message }`) when a request fails schema validation, instead of an empty 400, and declare the 400 on every endpoint.
