---
"@sigle/server": patch
---

Generate Sign in with Stacks nonces from `crypto.randomBytes` instead of the plugin's default generator, whose consecutive nonces overlapped.
