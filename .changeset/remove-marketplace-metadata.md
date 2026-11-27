---
"@sigle/sdk": minor
"@sigle/sigle": patch
"@sigle/server": patch
---

Remove the unused marketplace fields (`name`, `description`, `external_url`, `image`) from the signed post metadata. Sigle no longer writes them, and the post metadata schema no longer accepts them.
