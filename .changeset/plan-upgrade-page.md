---
"@sigle/server": patch
"@sigle/sdk": patch
"@sigle/sigle": patch
---

Let users upgrade to Pro from the website. `POST /api/me/plan/refresh` checks the user's wallets for an Explorer Guild NFT right away instead of waiting for the cached plan to expire. The new Plan page in the dashboard compares Free and Pro, links to the NFT marketplace, and activates Pro in one click, checking again when the user comes back from the marketplace, and thanks them in a welcome dialog. Free users now see the Image slash command and the cover image button with a Pro badge, which open an upgrade dialog, and the daily publish limit alert links to the Plan page. Image files dropped or pasted in the editor are uploaded again on Pro, and offer Pro on Free. `PUBLISH_LIMITS` and `UserPlan` move to `@sigle/sdk`.
