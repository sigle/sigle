---
"@sigle/server-v2": patch
---

Port posts discovery from the v1 indexer to server-v2: an `index-posts` scan job that pages Arweave since the latest indexed block and an `index-post` job that attaches each transaction to its root post (recording revision history and counts), provisions author wallets, and schedules cover ThumbHash placeholders. A 10-minute scheduler fiber with per-bucket dedupe starts the scan automatically.
