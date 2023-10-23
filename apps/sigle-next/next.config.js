const { withSentryConfig } = require('@sentry/nextjs');

/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  experimental: {
    // SWC is wrongly included in the final bundle causing function to be > 50mb
    // https://github.com/vercel/next.js/issues/42641#issuecomment-1615901228
    outputFileTracingExcludes: {
      '*': [
        './**/@swc/core-linux-x64-gnu*',
        './**/@swc/core-linux-x64-musl*',
        './**/@esbuild/linux-x64*',
      ],
    },
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
};

module.exports = withSentryConfig(
  nextConfig,
  { silent: true, dryRun: !process.env.SENTRY_AUTH_TOKEN },
  { hideSourceMaps: true },
);
