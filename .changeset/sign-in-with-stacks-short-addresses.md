---
"@sigle/server": patch
"@sigle/sigle": patch
---

Upgrade sign-in-with-stacks to 0.4.1, so wallets with an address shorter than 40 characters can sign in. 0.4.0 couldn't parse those addresses in the signed message, about 1 in 256 wallets, so their sign-ins were always rejected.
