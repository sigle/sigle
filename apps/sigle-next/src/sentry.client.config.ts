import { env } from '@/env';
import * as Sentry from '@sentry/nextjs';

Sentry.init({
  dsn: env.NEXT_PUBLIC_SENTRY_DSN,
  integrations: [Sentry.replayIntegration()],

  // Capture Replay for 1% of all sessions,
  // plus for 50% of sessions with an error
  replaysSessionSampleRate: 0.01,
  replaysOnErrorSampleRate: 0.5,
});
