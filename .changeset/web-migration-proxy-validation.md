---
"@sigle/sigle": patch
---

Validate the migration proxy's username and story id before calling the legacy API. Both went into the legacy API's URL unchanged, so a `../` in either could reach other GET routes on `api.sigle.io` through the website. The proxy now also keeps the legacy API's status, so an unknown username shows an error on the migration page instead of a 200 with an error object.
