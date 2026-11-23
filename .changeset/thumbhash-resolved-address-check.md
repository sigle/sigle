---
"@sigle/server": patch
---

Check the addresses an image host resolves to before generating its placeholder. The fetcher only blocked private IP literals and local names, so a public name pointing to a private, loopback, link-local or Railway private network address was fetched. Every resolved address is now checked when the connection is made, and a blocked one fails the job without retries.
