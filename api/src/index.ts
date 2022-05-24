import 'dotenv/config';
import { buildFastifyServer } from './app';
import { config } from './config';

// TODO sentry error reporting https://github.com/immobiliare/fastify-sentry
// TODO setup security (cors etc..)
// TODO setup rate limiting
// TODO setup documentation (.env.local etc..)
// TODO setup eslint

const fastify = buildFastifyServer({
  logger: false,
});

fastify.listen(config.PORT, '0.0.0.0', (err, address) => {
  if (err) throw err;
  console.log(`Server is now listening on ${address}`);
});
