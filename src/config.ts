export const config = {
  env: process.env.NODE_ENV,
  isServer: typeof window === 'undefined',
  appUrl: process.env.APP_URL as string,
  sentryDsn: process.env.SENTRY_DSN_CLIENT,
  fathomSiteId: process.env.FATHOM_SITE_ID,
  githubUrl: 'https://github.com/pradel/sigle',
  twitterUrl: 'https://twitter.com/sigleapp',
  telegramUrl: 'https://t.me/sigleapp',
  facebookUrl: 'https://www.facebook.com/sigleapp',
  messengerUrl: 'https://m.me/sigleapp',
  documentationUrl: 'https://docs.sigle.io',
  email: 'sigle@protonmail.com',
  // This reflect the tailwindcss config
  breakpoints: {
    sm: 640,
    md: 768,
    lg: 1024,
    xl: 1280,
  },
};
