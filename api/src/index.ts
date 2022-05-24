import 'dotenv/config';
import Fastify from 'fastify';
import { config } from './config';

const fastify = Fastify({
  logger: false,
});

fastify.get('/', (_, reply) => {
  reply.send({
    message: 'hello world',
  });
});

fastify.listen(config.PORT, '0.0.0.0', (err, address) => {
  if (err) throw err;
  console.log(`Server is now listening on ${address}`);
});
