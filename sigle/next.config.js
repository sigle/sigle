const dotenv = require('dotenv');
const withPlugins = require('next-compose-plugins');
const { withSentryConfig } = require('@sentry/nextjs');
const withBundleAnalyzer = require('@next/bundle-analyzer')({
  enabled: process.env.ANALYZE === 'true',
});

dotenv.config();

module.exports = withSentryConfig(
  withPlugins([[withBundleAnalyzer]], {
    env: {
      APP_URL: process.env.APP_URL,
      FATHOM_SITE_ID: process.env.FATHOM_SITE_ID,
      NEXT_PUBLIC_SENTRY_DSN: process.env.NEXT_PUBLIC_SENTRY_DSN,
      NEXT_PUBLIC_POSTHOG_TOKEN: process.env.NEXT_PUBLIC_POSTHOG_TOKEN,
    },
    headers: async () => {
      return [
        {
          source: '/manifest.json',
          headers: [
            {
              key: 'Access-Control-Allow-Origin',
              value: '*',
            },
            {
              key: 'Access-Control-Allow-Headers',
              value: '*',
            },
            {
              key: 'Content-Security-Policy-Report-Only',
              value: `
                  default-src 'self';
                  script-src 'self';
                  child-src example.com;
                  style-src 'self' example.com;
                  font-src 'self';
                  report-uri https://o72928.ingest.sentry.io/api/1419975/security/?sentry_key=82a06f89d9474f40abd8f2058bbf9c1e
                `
                .replace(/\s{2,}/g, ' ')
                .trim(),
            },
          ],
        },
      ];
    },
  }),
  {
    dryRun: process.env.NEXT_PUBLIC_APP_ENV !== 'production',
  }
);
