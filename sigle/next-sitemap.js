const appUrl = 'https://app.sigle.io';

// TODO generate a list of subdomains
// TODO check if these subdomains are using Sigle (get profile and check apps entry)
// TODO get list of stories.json and add them to the sitemap
// TODO Get from settings if website should not be listed

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
};
