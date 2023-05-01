const { withSentryConfig } = require('@sentry/nextjs');

/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  experimental: {
    appDir: true,
  },
  pageExtensions: [
    // `.page.tsx` for page components
    'page.tsx',
    // `.api.ts` for API routes
    'api.ts',
  ],
  compiler: {
    relay: {
      src: './src',
      artifactDirectory: './src/__generated__/relay',
      language: 'typescript',
    },
  },
  async rewrites() {
    return [
      // Proxy /ingest to PostHog
      // https://posthog.com/docs/advanced/proxy/nextjs
      {
        source: '/ingest/:path*',
        destination: 'https://app.posthog.com/:path*',
      },
    ];
  },
};

module.exports = withSentryConfig(
  nextConfig,
  { silent: true, dryRun: !process.env.SENTRY_AUTH_TOKEN },
  { hideSourceMaps: true }
);
