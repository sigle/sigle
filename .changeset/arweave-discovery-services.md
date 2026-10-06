---
"@sigle/server-v2": patch
---

Add the Arweave discovery service layer for the indexer port: a GraphQL client (transactions by tags and by id), metadata fetching/validation/signature verification for posts and profiles, `ensureUserByWalletAddress` provisioning for indexed authors, and an idempotent media placeholder helper that schedules the existing ThumbHash job.
