import Fastify from 'fastify';
import { analyticsRoutes } from './api/components/analytics/routes';

export const buildFastifyServer = (opts: any = {}) => {
  const fastify = Fastify(opts) as any;

  analyticsRoutes(fastify as any);

  return fastify;
};
