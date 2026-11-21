---
"@sigle/server": patch
---

Upload to R2 with the Effect-native `@distilled.cloud/s3` instead of `@aws-sdk/client-s3`. Objects are still written path-style with the same headers and metadata, and the production install loses 91 packages.
