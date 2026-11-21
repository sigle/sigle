---
"@sigle/server": patch
"@sigle/sdk": patch
---

Restrict the profile upload routes (`upload-metadata`, `images/:kind`) to whitelisted users, like drafts, and read the mainnet whitelist from the `WHITELISTED_ADDRESSES` config.
