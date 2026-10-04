---
"@sigle/server-v2": patch
---

Add OpenTimestamps notarization for published posts: create a proof with the metadata hash on publish, upgrade it until Bitcoin confirms, verify the block, and upload the final `.ots` proof to Arweave.
