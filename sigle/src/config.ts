export const sigleConfig = {
  env: process.env.NODE_ENV,
  isServer: typeof window === 'undefined',
  appUrl: process.env.APP_URL as string,
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
  explorerGuildUrl: 'https://www.explorerguild.io',
  feedbackUrl: 'https://sigle.canny.io/feature-requests',
  blogUrl: 'https://app.sigle.io/sigle.btc',
  gammaUrl: 'https://gamma.io/collections/the-explorer-guild',
  email: 'sigle@protonmail.com',
};

// Production list
export const allowedNewsletterUsers = [
  // sigle.btc
  'SP2EVYKET55QH40RAZE5PVZ363QX0X6BSRP4C7H0W',
  // leopradel.btc
  'SP3VCX5NFQ8VCHFS9M6N40ZJNVTRT4HZ62WFH5C4Q',
  // quentin.btc
  'SP24GYRG3M7T0S6FZE9RVVP9PNNZQJQ614650G590',
];
if (sigleConfig.env === 'development') {
  // gregogun.btc
  allowedNewsletterUsers.push('SP1F48HCD4SP4HT8BHQPXZ35615764KC80ACNMBDZ');
}
