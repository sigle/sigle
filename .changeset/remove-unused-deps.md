---
"@sigle/sigle": patch
---

Remove four website dependencies. `valid-url` was never imported. `query-string` is replaced by `URLSearchParams` in the route builder, and `nanoid` by `crypto.randomUUID()` for the temporary ids of uploading images. `framer-motion` is replaced by CSS in the Pro welcome dialog: the compass needle keeps its spring, sampled into a `linear()` easing, and the feature list fades in with tw-animate-css. Both animations only run when the user has not asked for reduced motion.
