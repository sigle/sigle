---
"@sigle/server": patch
---

Upgrade drizzle-orm and drizzle-kit to 1.0.0-rc.6. The SQLite driver now reads integer SQL expressions as bigint, so the per-user draft size check maps its sums to numbers; without it, saving a draft failed.
