---
"@sigle/server": patch
"@sigle/sdk": patch
"@sigle/sigle": patch
---

Let users upgrade to Pro from the website. The plan is stored on the user: `POST /api/me/plan/refresh` activates Pro when one of the user's wallets holds an Explorer Guild NFT, and Pro users are re-checked twice a day, so selling the NFT goes back to Free within a day. Holders are no longer detected automatically, and requests no longer depend on the Stacks API. The new Plan page in the dashboard compares Free and Pro, links to the NFT marketplace, and activates Pro in one click, checking again when the user comes back from the marketplace, and thanks them in a welcome dialog. Free users now see the Image slash command and the cover image button with a Pro badge, which open an upgrade dialog, and the daily publish limit alert links to the Plan page. Image files dropped or pasted in the editor are uploaded again on Pro, and offer Pro on Free.
