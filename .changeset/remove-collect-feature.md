---
"@sigle/docs": patch
"@sigle/sdk": patch
"@sigle/server": patch
"@sigle/sigle": patch
---

Remove the post collect feature. This deletes the Clarity post collectibles contracts and `@sigle/contracts-source-next`, the `mint`/`ownerMint`/`generatePostContract`/`setBaseTokenUri` SDK clients and mint fee config, the `collectible`/`minter_fixed_price`/`post_nft` database tables and collect draft fields, the collect indexer jobs and API fields, and the collect UI (collect dialog, cards, editor settings, referral links) across the frontend.
