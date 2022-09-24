/**
 * All the environment variables are defined here.
 * An error will be thrown if some environment variables are missing or invalid when the server starts.
 */
import { cleanEnv, str, port, url } from 'envalid';

export const config = cleanEnv(process.env, {
  /**
   * App config variables
   */
  APP_URL: url({ desc: 'Frontend application url.' }),

  /**
   * Plausible
   */
  PLAUSIBLE_API_TOKEN: str({ desc: 'Plausible API token.' }),
  PLAUSIBLE_SITE_ID: str({ desc: 'Plausible site id.' }),
  /**
   * Sentry
   */
  SENTRY_DSN: str({ desc: 'Sentry DSN for error reporting.' }),
});
