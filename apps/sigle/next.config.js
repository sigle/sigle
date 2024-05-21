const dotenv = require('dotenv');
const withPlugins = require('next-compose-plugins');
const { withSentryConfig } = require('@sentry/nextjs');
const withBundleAnalyzer = require('@next/bundle-analyzer')({
  enabled: process.env.ANALYZE === 'true',
});
const { withPlausibleProxy } = require('next-plausible');

dotenv.config();

/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: false,
  env: {
    APP_URL: process.env.APP_URL,
    FATHOM_SITE_ID: process.env.FATHOM_SITE_ID,
    NEXT_PUBLIC_SENTRY_DSN: process.env.NEXT_PUBLIC_SENTRY_DSN,
    NEXT_PUBLIC_POSTHOG_TOKEN: process.env.NEXT_PUBLIC_POSTHOG_TOKEN,
    API_URL: process.env.API_URL,
    NEXTAUTH_URL:
      process.env.VERCEL_ENV === 'preview'
        ? `https://${process.env.VERCEL_BRANCH_URL}`
        : process.env.NEXTAUTH_URL,
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
    withSentryConfig(nextConfig, {
      silent: !process.env.CI,
      widenClientFileUpload: true,
      disableLogger: true,
      automaticVercelMonitors: true,
    }),
];

module.exports = (phase) => {
  return withPlugins(nextPlugins, nextConfig)(phase, {});
};
