---
"@sigle/server-v2": patch
---

Port profiles discovery from the v1 indexer: an `index-profiles` scan job and an `index-profile` upsert job (signature replay and stale-block checks, wallet provisioning, picture and cover ThumbHash placeholders), a 10-minute scheduler fiber, a `profile.arweave_block_height` column, and admin endpoints to trigger posts and profiles scans on demand.
