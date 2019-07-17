import { theme, colors } from './theme';

export const config = {
  env: process.env.NODE_ENV,
  appUrl: process.env.APP_URL,
  sentryDsn: process.env.SENTRY_DSN_CLIENT,
  gumletUrl: process.env.GUMLET_URL,
  githubUrl: 'https://github.com/pradel/sigle',
  twitterUrl: 'https://twitter.com/sigleapp',
  // This reflect the tailwindcss config
  breakpoints: {
    sm: 640,
    md: 768,
    lg: 1024,
    xl: 1280,
  },
  theme,
  colors,
};
