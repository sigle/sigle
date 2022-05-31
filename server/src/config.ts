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
   * Fathom
   */
  FATHOM_API_TOKEN: str({ desc: 'Fathom API token.' }),
  FATHOM_ENTITY_ID: str({ desc: 'Fathom entity id.' }),
  /**
   * Sentry
   */
  SENTRY_DSN: str({ desc: 'Sentry DSN for error reporting.' }),
  /**
   * User authentication
   */
  NEXTAUTH_SECRET: str({
    desc: 'NextAuth.js secret. Should be the same value as the frontend.',
  }),
});
