---
"@sigle/sigle": patch
---

Remove three website dependencies. `valid-url` was never imported. `query-string` is replaced by `URLSearchParams` in the route builder, and `nanoid` by `crypto.randomUUID()` for the temporary ids of uploading images.
