---
"@sigle/server": patch
---

Upload to Arweave with the zero-dependency `@ardrive/turbo-upload` instead of `@ardrive/turbo-sdk`. Data items are signed the same way (ANS-104 type 4 with the Solana key), so ids and the owner address are unchanged, and the production install loses 541 packages.
