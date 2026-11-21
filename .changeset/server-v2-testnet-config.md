---
"@sigle/server": patch
---

Prepare the testnet deploy config. The server logs the Solana address holding the Turbo Credits that pay for Arweave uploads on startup, and the docs explain how to generate a new `ARWEAVE_PRIVATE_KEY` and top it up. The non-secret testnet variables live in a committed `.env.testnet` that the image loads at startup, with variables set on Railway taking precedence, and `scripts/sync-railway-env.sh` copies the secrets from 1Password Environments to the mapped Railway services. dotenvx is removed: the dev script uses Node's `--env-file` and the tests load `.env.test` through `loadEnv`.
