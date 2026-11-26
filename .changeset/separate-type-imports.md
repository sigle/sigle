---
"@sigle/server": patch
"@sigle/sigle": patch
"@sigle/sdk": patch
---

Write type-only imports as their own `import type` statements, so modules imported only for their types aren't loaded at runtime. `no-duplicate-imports` allows a separate `import type` next to a value import from the same module.
