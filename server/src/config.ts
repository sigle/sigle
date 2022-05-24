/**
 * All the environment variables are defined here.
 * An error will be thrown if some environment variables are missing or invalid when the server starts.
 */
import { cleanEnv, str, port } from 'envalid';

export const config = cleanEnv(process.env, {
  NODE_ENV: str({
    choices: ['development', 'test', 'production'],
    desc: 'Node.js environment',
  }),
  /**
   * Fastify
   */
  PORT: port({ desc: 'Port to run the server.' }),
  /**
   * Fathom
   */
  FATHOM_API_TOKEN: str({ desc: 'Fathom API token.' }),
  FATHOM_ENTITY_ID: str({ desc: 'Fathom entity id.' }),
});
