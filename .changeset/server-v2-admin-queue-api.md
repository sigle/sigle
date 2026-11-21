---
"@sigle/server": patch
"@sigle/sdk": patch
---

Admin queue API: reject unknown queue names with a 400, list registered queues that have no jobs yet with zero counts, and order failed jobs by `updated_at` then `id` so pagination is stable.
