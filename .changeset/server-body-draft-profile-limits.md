---
"@sigle/server": patch
"@sigle/sdk": patch
---

Limit what a client can make the server store or pay for. Request bodies are read up to 4 MiB, and up to 64 KiB on the `/api/auth/*` routes, with a 413 above that; before, any body was read whole into memory. Profile metadata over 32 KiB as JSON is rejected with a 413 before it is uploaded to Arweave. A user can have up to 100 drafts holding up to 10 MiB of content in total: creating another draft, or saving a longer content past that total, returns a 403. Shortening or deleting drafts always works.
