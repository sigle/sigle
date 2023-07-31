const dotenv = require('dotenv');
const withPlugins = require('next-compose-plugins');
const { withSentryConfig } = require('@sentry/nextjs');
const withBundleAnalyzer = require('@next/bundle-analyzer')({
  enabled: process.env.ANALYZE === 'true',
});
const { withPlausibleProxy } = require('next-plausible');

dotenv.config();

/**
 * On vercel preview deployments we overwrite the NEXTAUTH_URL value to the
 * branch pull request one. The git branch name can contain `/` so we replace them with `-`
 */
const getVercelPreviewUrl = () => {
  return `https://${
    process.env.VERCEL_GIT_REPO_SLUG
  }-git-${process.env.VERCEL_GIT_COMMIT_REF.replace(
    new RegExp('/', 'g'),
    '-'
  )}-${process.env.VERCEL_GIT_REPO_OWNER}.vercel.app`;
};

/** @type {import('next').NextConfig} */
const nextConfig = {
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
  reactStrictMode: false,
  swcMinify: true,
  env: {
    APP_URL: process.env.APP_URL,
    FATHOM_SITE_ID: process.env.FATHOM_SITE_ID,
    NEXT_PUBLIC_SENTRY_DSN: process.env.NEXT_PUBLIC_SENTRY_DSN,
    NEXT_PUBLIC_POSTHOG_TOKEN: process.env.NEXT_PUBLIC_POSTHOG_TOKEN,
    API_URL: process.env.API_URL,
    NEXTAUTH_URL:
      process.env.VERCEL_ENV === 'preview'
        ? getVercelPreviewUrl()
        : process.env.NEXTAUTH_URL,
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
  webpack: (config) => {
    config.resolve.alias = {
      ...config.resolve.alias,
      // alias stacks.js packages to their esm (default prefers /dist/polyfill)
      '@stacks/auth': '@stacks/auth/dist/esm',
      '@stacks/common': '@stacks/common/dist/esm',
      '@stacks/encryption': '@stacks/encryption/dist/esm',
      '@stacks/keychain': '@stacks/keychain/dist/esm',
      '@stacks/network': '@stacks/network/dist/esm',
      '@stacks/profile': '@stacks/profile/dist/esm',
      '@stacks/storage': '@stacks/storage/dist/esm',
      '@stacks/transactions': '@stacks/transactions/dist/esm',
      '@stacks/wallet-sdk': '@stacks/wallet-sdk/dist/esm',
    };
    return config;
  },
};

const nextPlugins = [
  [
    withPlausibleProxy({
      scriptName: 'index',
    }),
  ],
  [withBundleAnalyzer],
  (nextConfig) =>
    withSentryConfig(
      {
        ...nextConfig,
        sentry: {
          // Use `hidden-source-map` rather than `source-map` as the Webpack `devtool`
          // for client-side builds. (This will be the default starting in
          // `@sentry/nextjs` version 8.0.0.) See
          // https://webpack.js.org/configuration/devtool/ and
          // https://docs.sentry.io/platforms/javascript/guides/nextjs/manual-setup/#use-hidden-source-map
          // for more information.
          hideSourceMaps: true,
          widenClientFileUpload: true,
        },
      },
      {
        dryRun: !process.env.SENTRY_AUTH_TOKEN,
      }
    ),
];

module.exports = (phase) => {
  return withPlugins(nextPlugins, nextConfig)(phase, {});
};
