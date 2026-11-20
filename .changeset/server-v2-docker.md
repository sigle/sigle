---
"@sigle/server-v2": patch
---

Add a Dockerfile and Railway config for server-v2, and make the built server runnable: find the Drizzle migrations from the package root instead of the source file, bundle `@sigle/sdk` into `dist/main.mjs`, and install the PGlite packages as production dependencies since the bundle imports them.
