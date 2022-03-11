const urls = require('../packages/sitemap-scripts/urls.json');
const appUrl = 'https://app.sigle.io';

/** @type {import('next-sitemap').IConfig} */
module.exports = {
  siteUrl: appUrl,
  generateRobotsTxt: true,
  exclude: [
    // Exclude all the protected routes
    '/login',
    '/register-username',
    '/published',
    '/settings',
  ],
  additionalPaths: () => {
    const result = [];

    urls.forEach((url) => {
      // all possible values
      result.push({
        loc: url,
        changefreq: 'weekly',
        priority: 0.5,
      });
    });

    return result;
  },
};
