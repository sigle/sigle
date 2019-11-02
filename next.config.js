const dotenv = require('dotenv');
const withPlugins = require('next-compose-plugins');
const withCSS = require('@zeit/next-css');

dotenv.config();

module.exports = withPlugins([[withCSS]], {
  env: {
    APP_URL: process.env.APP_URL || 'http://localhost:3000',
    SENTRY_DSN_CLIENT: process.env.SENTRY_DSN_CLIENT,
    FATHOM_SITE_ID: process.env.FATHOM_SITE_ID,
  },
});
