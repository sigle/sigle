---
"@sigle/server-v2": patch
---

Index profiles from Arweave. A background scan queries the gateway GraphQL index for `App-Name`/`Type=profile` transactions signed by the server's own Arweave key, so an old signed profile republished by someone else is never picked up, and an `index-profile` job stores each mined transaction: it sets `profile.arweave_block_height` for the stored transaction, keeps a stored profile that is not mined yet or mined at the same or a higher block, skips replayed signatures, and restores profiles whose database write was lost after the Arweave upload. Uploading new profile metadata clears the block height until the new transaction is mined.
