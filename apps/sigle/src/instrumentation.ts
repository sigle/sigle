import * as Sentry from '@sentry/nextjs';

export async function register() {
  const SENTRY_DSN =
    process.env.SENTRY_DSN || process.env.NEXT_PUBLIC_SENTRY_DSN;

  if (process.env.NEXT_RUNTIME === 'nodejs') {
    Sentry.init({
      dsn: SENTRY_DSN,
    });
  }

  if (process.env.NEXT_RUNTIME === 'edge') {
    Sentry.init({
      dsn: SENTRY_DSN,
    });
  }
}
