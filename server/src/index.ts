import 'dotenv/config';
import { config } from './config';
import { buildFastifyServer } from './server';

const fastify = buildFastifyServer({
  logger: false,
});

fastify.listen(config.PORT, '0.0.0.0', (err, address) => {
  if (err) throw err;
  console.log(`Server is now listening on ${address}`);
});
