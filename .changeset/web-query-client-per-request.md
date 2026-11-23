---
"@sigle/sigle": patch
---

Create a new query client for each server render. The website shared one client across every request on the server, and TanStack Query never clears server caches, so pages kept rendering the data from their first render until the next deploy, and the cache grew with every page served.
