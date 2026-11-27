---
"@sigle/sigle": patch
---

Send a fuller `Content-Security-Policy` from the website. Pages only allow frames of YouTube, the videos embedded in posts, and no longer allow a `<base>` of another site, forms posting to another site, or plugins. The RSS feed and the other `/api` routes send `default-src 'none'` with `sandbox`, so a browser opening one of them as a page loads and runs nothing. Scripts, styles, images and connections are not restricted.
