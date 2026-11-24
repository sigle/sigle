---
"@sigle/server": patch
"@sigle/docs": patch
---

Upgrade vite-plus to 1.8.0 (Vite+ core 8.3.8001, Vitest 5.1.1, Oxlint 1.94, oxfmt 0.79) and @effect/tsgo to 0.73.4, which now patches tsrs, the TypeScript 7.1 port vite-plus type-checks with. Sequential `Effect.forEach` and `Effect.all` calls now say so with `concurrency: 1`, as the new `missing-concurrency-option` rule asks; behavior is unchanged. Upgrade Astro to 7.4.13.
