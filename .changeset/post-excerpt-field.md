---
"@sigle/server": patch
"@sigle/sdk": patch
"@sigle/sigle": patch
---

Move the post excerpt out of the metadata attributes. Post metadata now carries a required `content.excerpt` field instead of an attribute with the `excerpt` key, and the server reads the excerpt of a published post from it.
