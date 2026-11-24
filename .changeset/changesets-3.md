---
---

Upgrade @changesets/cli to 3.0.3. Changesets no longer formats changelogs with its bundled Prettier, so the root `version` script now runs `vp fmt` after `changeset version`, and the config sets `"format": false` so Changesets doesn't look for a formatter of its own.
