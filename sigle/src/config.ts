export const sigleConfig = {
  env: process.env.NODE_ENV,
  isServer: typeof window === 'undefined',
  appUrl: process.env.APP_URL as string,
  // TODO change part using this code
  baseUrl: process.env.API_URL,
  apiUrl: process.env.API_URL,
  landingUrl: 'https://www.sigle.io',
  sentryDsn: process.env.NEXT_PUBLIC_SENTRY_DSN,
  fathomSiteId: process.env.FATHOM_SITE_ID,
  fathomSiteUrl: 'https://louse.sigle.io/script.js',
  posthogToken: process.env.NEXT_PUBLIC_POSTHOG_TOKEN,
  githubUrl: 'https://github.com/sigle/sigle',
  twitterUrl: 'https://twitter.com/sigleapp',
  discordUrl: 'https://discord.gg/X2Dbz3xbrs',
  messengerUrl: 'https://m.me/sigleapp',
  documentationUrl: 'https://docs.sigle.io',
  feedbackUrl: 'https://sigle.canny.io/feature-requests',
  blogUrl: 'https://app.sigle.io/sigleapp.id.blockstack',
  gammaUrl: 'https://gamma.io/collections/the-explorer-guild',
  email: 'sigle@protonmail.com',
  // This reflect the tailwindcss config
  breakpoints: {
    sm: 640,
    md: 768,
    lg: 1024,
    xl: 1280,
  },
};
