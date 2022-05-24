import 'dotenv/config';
import Fastify from 'fastify';
import { config } from './config';

const fastify = Fastify({
  logger: false,
});

fastify.get('/health', (_, res) => {
  res.send({
    success: true,
  });
});

fastify.listen(config.PORT, '0.0.0.0', (err, address) => {
  if (err) throw err;
  console.log(`Server is now listening on ${address}`);
});
