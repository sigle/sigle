---
"@sigle/server-v2": patch
---

Add image placeholder metadata: a `media_image` table and a `generate-image-thumbhash` job compute ThumbHash placeholders for post covers, profile avatars and covers. Profile image uploads compute their placeholder inline, and profiles now expose `picture`/`coverPicture` as `{ url, width, height, thumbhash }` with the media rows versioning the ETag.
