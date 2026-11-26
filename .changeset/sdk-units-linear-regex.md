---
"@sigle/sdk": patch
---

Fix `parseUnits` and `formatUnits` taking quadratic time on long runs of zeros, such as about a minute for a 200,000-digit input. The decimal check no longer lets a run of digits match two ways, and trailing zeros are trimmed with a loop instead of `/(0+)$/`.
