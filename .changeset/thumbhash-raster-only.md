---
"@sigle/server": patch
---

Only hand PNG, JPEG, GIF and WebP images to sharp. Image format detection checks the file signature first, so an SVG or any other format is rejected without being parsed, and the thumbhash job fails a cover in any other format permanently. The thumbhash job also rejects images that decode to more than 80 MiB, like uploads.
