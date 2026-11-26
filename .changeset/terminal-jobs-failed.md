---
"@sigle/server": patch
---

Background jobs that fail with a non-retryable error are recorded as failed, so they appear in the admin failed-jobs list and can be retried, instead of being recorded as completed.
