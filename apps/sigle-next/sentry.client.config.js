// This file configures the initialization of Sentry on the browser.
// The config you add here will be used whenever a page is visited.
// https://docs.sentry.io/platforms/javascript/guides/nextjs/

import * as Sentry from '@sentry/nextjs';
import posthog from 'posthog-js';

const SENTRY_DSN = process.env.SENTRY_DSN || process.env.NEXT_PUBLIC_SENTRY_DSN;
const sentryProjectId = SENTRY_DSN ? SENTRY_DSN.split('/')[3] : '';

Sentry.init({
  dsn: SENTRY_DSN,
  tracesSampleRate: 1.0,
  integrations: [
    new posthog.SentryIntegration(
      posthog,
      process.env.NEXT_PUBLIC_SENTRY_ORG,
      sentryProjectId,
    ),
  ],
});
