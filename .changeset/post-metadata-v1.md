---
"@sigle/sdk": minor
"@sigle/server": patch
"@sigle/sigle": patch
"@sigle/docs": patch
---

Rewrite the post metadata format before launch. Excerpt, meta title, meta description and canonical URL are real fields instead of attributes, and posts carry their publish date, an optional previous revision, and the size of their cover image. The marketplace fields, content warnings and typed attributes are removed. Authors now sign posts as SIP-018 structured data over the hash of the canonical JSON, so wallets show the post id and title instead of the whole post. A published post keeps its draft id, so its URL stays the same across revisions. GIF covers can be published. The JSON Schemas are served from `https://docs.sigle.io/schemas/`.
