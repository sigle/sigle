---
"@sigle/sigle": patch
"@sigle/server": patch
---

Add a Playwright end-to-end suite for the website, run with `pnpm e2e` and in CI. It drives a production build of the website against the real API, started with an in-memory database and test doubles for the outside services (`apps/server/src/test/e2e-server.ts`), and a wallet that signs in the browser with a throwaway testnet key. Starts with signing in and out.
