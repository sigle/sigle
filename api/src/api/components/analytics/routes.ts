import { FastifyInstance } from 'fastify';
import { createAnalyticsReferrersEndpoint } from './referrers';

export async function analyticsRoutes(fastify: FastifyInstance) {
  createAnalyticsReferrersEndpoint(fastify);
}
