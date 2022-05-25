import Fastify, { FastifyServerOptions, FastifyLoggerInstance } from 'fastify';
import FastifyCors from '@fastify/cors';
import FastifyRateLimit from '@fastify/rate-limit';
import { Server } from 'http';
import * as Sentry from '@sentry/node';
import { createAnalyticsHistoricalEndpoint } from './api/modules/analytics/historical';
import { createAnalyticsReferrersEndpoint } from './api/modules/analytics/referrers';
import { config } from './config';

export const buildFastifyServer = (
  opts: FastifyServerOptions<Server, FastifyLoggerInstance> = {}
) => {
  const fastify = Fastify(opts);

  /**
   * Cors is disabled for local env.
   * Cors is enabled on prod and allowed only for the APP_URL.
   */
  fastify.register(FastifyCors, {
    origin: (origin, cb) => {
      if (config.NODE_ENV === 'development' || origin === config.APP_URL) {
        cb(null, true);
        return;
      }
      cb(new Error('Not allowed'), false);
    },
  });

  /**
   * Rate limit is disabled for local env.
   * Max 50 requests per minute.
   */
  fastify.register(FastifyRateLimit, {
    max: 50,
    timeWindow: 60000,
  });

  /**
   * Catch and report errors with Sentry.
   * We attach some content to make it easier to debug.
   */
  fastify.setErrorHandler(async (error, request, reply) => {
    Sentry.withScope((scope) => {
      scope.setLevel(Sentry.Severity.Error);
      scope.setTag('path', request.url);
      scope.setExtra('headers', request.headers);
      if (
        request.headers['content-type'] === 'application/json' &&
        request.body
      ) {
        scope.setExtra('body', request.body);
      }

      const sentryId = Sentry.captureException(error);
      // Also log to the console in case it's not reported to sentry
      console.error(sentryId, error);
      reply.status(500).send({
        error: 'Something went wrong please try again after some time',
        errorId: sentryId,
      });
    });
  });

  fastify.get('/health', (_, res) => {
    res.send({
      success: true,
    });
  });

  /**
   * Analytics routes
   */
  createAnalyticsReferrersEndpoint(fastify);
  createAnalyticsHistoricalEndpoint(fastify);

  return fastify;
};
