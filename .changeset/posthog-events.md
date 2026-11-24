---
"@sigle/server": patch
"@sigle/sigle": patch
---

Fix and extend PostHog tracking. Logging out now resets PostHog, so the next visitor of the browser isn't tracked as the previous user, and the publish error events send the error message instead of an `Error` that serialized to `{}`. New events: `user_signed_up` when a wallet signs in for the first time, `draft_publish_failed` when a publish job fails for good, `upgrade_prompt_viewed`/`upgrade_prompt_clicked` with the `publish_limit` trigger on the daily publish limit alert, and `post_link_copied`/`post_shared` from the post share dialog.
