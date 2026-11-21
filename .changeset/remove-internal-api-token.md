---
"@sigle/sigle": patch
---

Remove the unused `INTERNAL_API_TOKEN` env variable and the server's internal API auth middleware, left over from the next-auth sign-in.

Drop dotenvx from the website: the Sentry DSN moves to the plain `.env.testnet`, so it is built into the browser bundle and client-side Sentry reports again, and the image starts with `node` directly.
