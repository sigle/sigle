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
    pageExtensions: [
      // `.page.tsx` for page components
      'page.tsx',
      // `.api.ts` for API routes
      'api.ts',
    ],
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
          ],
        },
      ];
    },
  }),
  {
    dryRun: process.env.NEXT_PUBLIC_APP_ENV !== 'production',
  }
);
