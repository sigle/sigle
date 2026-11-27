---
"@sigle/sigle": patch
"@sigle/server": patch
---

Add end-to-end tests for the profile settings: editing the profile shown on the blog, and uploading a profile picture. The test API serves the uploaded files itself, and the website's image optimizer accepts a CDN on `localhost` so the tests display them.
