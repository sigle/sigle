---
"@sigle/server": minor
"@sigle/sdk": patch
---

Add a global daily publish limit per plan, bounding the Arweave uploads the server pays for now that every wallet can publish. All Free users together can publish `PUBLISH_GLOBAL_DAILY_LIMIT_FREE` posts per 24 hours and all Pro users `PUBLISH_GLOBAL_DAILY_LIMIT_PRO`, 200 each by default, on top of the per-user limits. Each plan has its own, so Free accounts reaching theirs don't block Pro accounts. Once reached, publishing returns a 429, and the server reports it to Sentry at most once per plan and hour.
