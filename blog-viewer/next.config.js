const { withSentryConfig } = require('@sentry/nextjs');

module.exports = withSentryConfig(
  {
    env: {
      FATHOM_SITE_ID: process.env.FATHOM_SITE_ID,
      NEXT_PUBLIC_SENTRY_DSN: process.env.NEXT_PUBLIC_SENTRY_DSN,
    },
  },
  {
    dryRun: process.env.NEXT_PUBLIC_APP_ENV !== 'production',
  }
);
