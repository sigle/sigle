---
"@sigle/server-v2": patch
---

Add `PlanService` with `hasTegNft(address)`, which checks Explorer Guild NFT holdings on the Hiro mainnet API, and `getUserPlan(userId)`, which returns `pro` for holders and `free` otherwise. `PRO_ADDRESSES` puts wallet addresses on the pro plan, to emulate pro users on testnet where the NFT is not deployed.
