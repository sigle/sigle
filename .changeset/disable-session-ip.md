---
"@sigle/server": patch
---

Stop storing IP addresses. better-auth saved the client IP of every sign-in on its session; IP tracking is now disabled, and a migration clears the IPs stored so far.
