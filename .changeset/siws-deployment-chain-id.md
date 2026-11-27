---
"@sigle/server": patch
---

Reject a Sign in with Stacks message signed for another network than the deployment's `STACKS_ENV`: a testnet server no longer signs in a mainnet signature as a separate user, and the reverse.
