import Fastify, { FastifyServerOptions, FastifyLoggerInstance } from 'fastify';
import { Server } from 'http';
import { createAnalyticsReferrersEndpoint } from './api/modules/analytics/referrers';

export const buildFastifyServer = (
  opts: FastifyServerOptions<Server, FastifyLoggerInstance> = {}
) => {
  const fastify = Fastify(opts);

  fastify.get('/health', (_, res) => {
    res.send({
      success: true,
    });
  });

  /**
   * Analytics routes
   */
  createAnalyticsReferrersEndpoint(fastify);

  return fastify;
};
