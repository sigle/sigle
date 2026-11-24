---
"@sigle/sigle": patch
---

Create one draft per new post. The new post page created its draft from an effect, and React runs effects twice in Strict Mode, so starting a post in development created two drafts.
