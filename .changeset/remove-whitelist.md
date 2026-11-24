---
"@sigle/server": minor
"@sigle/sdk": minor
"@sigle/sigle": minor
---

Remove the whitelist. Every signed-in user can now write drafts and update their profile on mainnet, not only the wallets in `WHITELISTED_ADDRESSES`. The `WHITELISTED_ADDRESSES` env variable and the `whitelisted` field of `GET /api/me` are removed, and the website shows the drafts, plan, and "Write a post" entries to every signed-in user.
