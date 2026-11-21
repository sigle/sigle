---
"@sigle/server": patch
"@sigle/sigle": patch
---

Send traces to Railway. The server exports its Effect spans over OTLP, and the website exports its Next.js spans with `@vercel/otel` and passes the trace on to the API. Both export only when Railway's `OTEL_*` variables are set.
