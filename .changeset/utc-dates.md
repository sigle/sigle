---
"@sigle/sigle": patch
---

Post and profile dates are shown in the reader's own timezone and date format. The page first renders them in UTC, so the server render and the browser match and no longer cause hydration errors.
