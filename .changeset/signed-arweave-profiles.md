---
"@sigle/docs": patch
"@sigle/sdk": patch
"@sigle/server": patch
"@sigle/server-v2": patch
"@sigle/sigle": patch
---

Store profiles on Arweave instead of Stacks smart contracts. Profile metadata is now signed with the user's wallet, uploaded with `Author`/`Type` tags, and indexed from the Arweave GraphQL API. This removes the `sigle-profiles-v001`/`sigle-registry-v001` contracts, the `setProfile`/`publishPost` SDK clients, and the profile contract call from the settings flow, so updating a profile no longer requires a gas fee.
