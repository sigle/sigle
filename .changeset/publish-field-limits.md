---
"@sigle/sdk": patch
"@sigle/server": patch
"@sigle/sigle": patch
---

Add size limits to the post metadata format, the ones a draft is held to. `PostMetadataSchema` caps the title, content, excerpt, `name`, `description`, attribute values and cover image URL, which must be http(s), `ipfs://` or `ar://`. The `meta-title`, `meta-description` and `canonical-uri` attributes, now named by `PostAttributeKey`, must be String attributes, appear at most once, and hold at most 100 characters, 250 characters and an http(s) URL of 200 characters. The limits are exported as `POST_METADATA_LIMITS`, the server takes its draft limits from them, and publishing rejects metadata outside them.
