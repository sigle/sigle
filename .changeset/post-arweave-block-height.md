---
"@sigle/server": patch
---

Record the Arweave block height of published posts. Every 10 minutes, the server asks the Arweave gateway GraphQL index for the posts without a block height and stores the block of the ones that are mined, so `arweaveBlockHeight` is no longer always null and the post page shows the Arweave block. Existing posts are filled in on the first run.
