---
"@sigle/sigle": patch
---

Keep post titles and excerpts that contain `]]>` inside their CDATA section in the RSS feed. The feed's XML writer only escaped the first `]]>`, so a later one ended the section early.
