export const sigleConfig = {
  env: process.env.NODE_ENV,
  isServer: typeof window === 'undefined',
  appUrl: process.env.APP_URL as string,
  sentryDsn: process.env.NEXT_PUBLIC_SENTRY_DSN,
  fathomSiteId: process.env.FATHOM_SITE_ID,
  fathomSiteUrl: 'https://louse.sigle.io/script.js',
  githubUrl: 'https://github.com/pradel/sigle',
  twitterUrl: 'https://twitter.com/sigleapp',
  discordUrl: 'https://discord.gg/X2Dbz3xbrs',
  facebookUrl: 'https://www.facebook.com/sigleapp',
  messengerUrl: 'https://m.me/sigleapp',
  documentationUrl: 'https://docs.sigle.io',
  buyMeACoffeeUrl: 'https://www.buymeacoffee.com/sigle',
  email: 'sigle@protonmail.com',
  // This reflect the tailwindcss config
  breakpoints: {
    sm: 640,
    md: 768,
    lg: 1024,
    xl: 1280,
  },
};
