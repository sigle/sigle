import Fastify from 'fastify';

const port = process.env.PORT || 3000;

const fastify = Fastify({
  logger: false,
});

fastify.get('/', (_, reply) => {
  reply.send({
    message: 'hello world',
  });
});

fastify.listen(port, '0.0.0.0', (err, address) => {
  if (err) throw err;
  console.log(`Server is now listening on ${address}`);
});
