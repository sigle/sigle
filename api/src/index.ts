import 'dotenv/config';
import Fastify from 'fastify';
import { analyticsRoutes } from './api/components/analytics/routes';
import { config } from './config';

// TODO sentry error reporting https://github.com/immobiliare/fastify-sentry
// TODO setup security (cors etc..)
// TODO setup rate limiting
// TODO setup documentation (.env.local etc..)

const fastify = Fastify({
  logger: false,
});

fastify.get('/', (_, reply) => {
  reply.send({
    message: 'hello world',
  });
});

analyticsRoutes(fastify);

fastify.listen(config.PORT, '0.0.0.0', (err, address) => {
  if (err) throw err;
  console.log(`Server is now listening on ${address}`);
});
