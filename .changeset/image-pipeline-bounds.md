---
"@sigle/server": patch
---

Bound the memory an image upload takes: images are resized to fit a maximum height as well as a maximum width, uploads that decode to more than 80 MiB are rejected with 413, and WebP is encoded at effort 4 instead of 6.
