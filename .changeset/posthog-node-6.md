---
"@sigle/server": patch
"@sigle/sigle": patch
---

Upgrade posthog-node to 6.0.6 on the server and the website. It sends events to `/i/v1/analytics/events` with the project key as a bearer token. Errors are reported with the options form of `captureException`, since the positional form is deprecated in v6. On the server, events PostHog fails to deliver, including error reports, are now logged as warnings, because v6 no longer rejects `flush()` or `shutdown()`.
