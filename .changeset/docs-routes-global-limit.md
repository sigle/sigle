---
"@sigle/server": patch
---

Count every request but `/health` against the global rate limit of its IP, including `/_scalar`, `/_openapi.json` and unknown paths, with one router middleware in place of the per-group one. `/_scalar` now loads Scalar from jsDelivr, pinned to 1.81.0, instead of inlining its 5 MB bundle in every response.
