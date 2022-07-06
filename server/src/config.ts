/**
 * All the environment variables are defined here.
 * An error will be thrown if some environment variables are missing or invalid when the server starts.
 */
import { cleanEnv, str, port, url } from 'envalid';

export const config = cleanEnv(process.env, {
  NODE_ENV: str({
    choices: ['development', 'test', 'production'],
    desc: 'Node.js environment',
  }),
  /**
   * App config variables
   */
  APP_URL: url({ desc: 'Frontend application url.' }),
  /**
   * Fastify
   */
  PORT: port({ desc: 'Port to run the server.' }),
  /**
   * Redis
   */
  REDIS_DATABASE_URL: str({ desc: 'Redis database url.' }),
  /**
   * Postgres
   */
  PG_DATABASE_URL: str({ desc: 'Postgres database url.' }),
  /**
   * Plausible
   */
  PLAUSIBLE_API_TOKEN: str({ desc: 'Plausible API token.' }),
  PLAUSIBLE_SITE_ID: str({ desc: 'Plausible site id.' }),
  /**
   * Sentry
   */
  SENTRY_DSN: str({ desc: 'Sentry DSN for error reporting.' }),
  /**
   * User authentication
   */
  NEXTAUTH_URL: str({
    desc: 'NextAuth.js frontend url.',
  }),
  NEXTAUTH_SECRET: str({
    desc: 'NextAuth.js secret. Should be the same value as the frontend.',
  }),
});
