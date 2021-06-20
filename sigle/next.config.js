const dotenv = require('dotenv');
const withPlugins = require('next-compose-plugins');
const { withSentryConfig } = require('@sentry/nextjs');

dotenv.config();

module.exports = withSentryConfig(
  {
    env: {
      APP_URL: process.env.APP_URL,
      FATHOM_SITE_ID: process.env.FATHOM_SITE_ID,
      NEXT_PUBLIC_SENTRY_DSN: process.env.NEXT_PUBLIC_SENTRY_DSN,
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
          ],
        },
      ];
    },
  },
  {
    dryRun: process.env.NEXT_PUBLIC_APP_ENV !== 'production',
  }
);
