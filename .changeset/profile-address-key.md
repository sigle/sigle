---
"@sigle/server-v2": patch
---

Key server-v2 profiles by the signing Stacks address instead of the user account, so a profile published on Arweave can be stored for an address that never signed in. `GET /api/users/:username` now returns a profile for any address that published one, and returns `profile: null` for a signed-in address without one.
