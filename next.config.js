const dotenv = require('dotenv');
const withPlugins = require('next-compose-plugins');
const withCSS = require('@zeit/next-css');
const withBundleAnalyzer = require('@zeit/next-bundle-analyzer');
const withOptimizedImages = require('next-optimized-images');

dotenv.config();

module.exports = withPlugins(
  [
    [withOptimizedImages, {}],
    [withCSS],
    [
      withBundleAnalyzer,
      {
        analyzeServer: ['server', 'both'].includes(process.env.BUNDLE_ANALYZE),
        analyzeBrowser: ['browser', 'both'].includes(
          process.env.BUNDLE_ANALYZE
        ),
        bundleAnalyzerConfig: {
          server: {
            analyzerMode: 'static',
            reportFilename: '../bundles/server.html',
          },
          browser: {
            analyzerMode: 'static',
            reportFilename: '../bundles/client.html',
          },
        },
      },
    ],
  ],
  {
    env: {
      APP_URL: process.env.APP_URL || 'http://localhost:3000',
      SENTRY_DSN_CLIENT: process.env.SENTRY_DSN_CLIENT,
      GUMLET_URL: process.env.GUMLET_URL,
    },
  }
);
