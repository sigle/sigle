---
"@sigle/server": patch
"@sigle/sigle": patch
---

Fix `scripts/sync-railway-env.sh` rejecting every secret as ending with a CR or LF. `op run` empties whitespace-only variables, so the `CR` and `LF` the check received were empty and matched every value; the check now defines them itself.
