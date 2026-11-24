---
"@sigle/server": patch
"@sigle/sdk": patch
"@sigle/sigle": patch
---

Let writers mark a story Sensitive, NSFW or Spoiler from the post settings. The warning is part of the signed post metadata, and drafts and posts return it as `contentWarning`. A Sensitive or NSFW story hides its cover and content until the reader chooses to see it, and a Spoiler blurs its cover. Feeds, link previews and RSS show the warning instead of the excerpt.
