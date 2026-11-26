---
"@sigle/server": patch
"@sigle/sigle": patch
"@sigle/sdk": patch
---

Lint with `@cloudflare/oxlint-config` instead of every Oxlint category and the vendored anti-slop plugin. Its nkzw base ships the same quality rules as anti-slop, so `tools/oxlint/anti-slop` is removed, along with the rules the config turned off one by one. The 39 preset rules the code doesn't pass yet are off for now, and the disable comments for rules that no longer run are removed.
