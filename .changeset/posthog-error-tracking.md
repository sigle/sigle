---
"@sigle/server": patch
"@sigle/sigle": patch
---

Replace Sentry with PostHog error tracking. The server reports unexpected errors through `PostHogService.captureException` (client 4xx errors stay ignored) and drops `SENTRY_DSN`; the web app captures uncaught browser errors and unhandled rejections with posthog-js, reports server render and route handler errors from `onRequestError` with posthog-node, uploads its source maps to PostHog at build time when `POSTHOG_PERSONAL_API_KEY` is set, and removes `@sentry/nextjs`.
