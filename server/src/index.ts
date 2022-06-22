import 'dotenv/config';
import * as Sentry from '@sentry/node';
import { config } from './config';
import { buildFastifyServer } from './server';

Sentry.init({
  dsn: config.SENTRY_DSN,
});

const fastify = buildFastifyServer({
  logger: false,
});

fastify.listen({ port: config.PORT, host: '0.0.0.0' }, (err, address) => {
  if (err) throw err;
  console.log(`Server is now listening on ${address}`);
});
