---
"@sigle/server": patch
---

Each accepted publish now runs as its own queue job, and the draft upload claim is removed. A publish caught by a deploy, a request sent twice, or a retry right after a failure no longer ends as a false failure.
