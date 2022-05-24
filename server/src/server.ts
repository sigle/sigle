import Fastify, { FastifyServerOptions, FastifyLoggerInstance } from 'fastify';
import { Server } from 'http';

export const buildFastifyServer = (
  opts: FastifyServerOptions<Server, FastifyLoggerInstance> = {}
) => {
  const fastify = Fastify(opts);

  fastify.get('/health', (_, res) => {
    res.send({
      success: true,
    });
  });

  return fastify;
};
