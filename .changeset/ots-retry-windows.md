---
"@sigle/server": patch
---

Make OpenTimestamps proofs more resilient: only record a proof as upgraded once it verifies against a Bitcoin block (pending or Esplora errors now retry), retry stamping for about 6 hours instead of a few seconds, and keep polling calendars daily for a month after the first 48 hours.
