---
"@sigle/server-v2": patch
---

Add Arweave block-height enrichment for published posts: an `update-arweave-block-height` job retried for ~48 hours until the transaction is mined, offered after publishing, plus a 10-minute reconciliation fiber that re-offers lost jobs for posts still missing a height.
