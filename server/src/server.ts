import Fastify, { FastifyServerOptions, FastifyLoggerInstance } from 'fastify';
import FastifyCors from '@fastify/cors';
import FastifyRateLimit from '@fastify/rate-limit';
import { Server } from 'http';
import * as Sentry from '@sentry/node';
import { createAnalyticsHistoricalEndpoint } from './api/modules/analytics/historical';
import { createAnalyticsReferrersEndpoint } from './api/modules/analytics/referrers';
import { config } from './config';
import { redis } from './redis';

export const buildFastifyServer = (
  opts: FastifyServerOptions<Server, FastifyLoggerInstance> = {}
) => {
  const fastify = Fastify(opts);

  /**
   * Cors is disabled for local env.
   * Cors is enabled on prod and allowed only for the APP_URL.
   * Allow the RENDER API to make calls, used to bypass CORS for the health check, in such case origin will be undefined.
   */
  fastify.register(FastifyCors, {
    origin: (origin, cb) => {
      if (
        config.NODE_ENV === 'development' ||
        origin === config.APP_URL ||
        origin === undefined
      ) {
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
    redis,
  });

  /**
   * Catch and report errors with Sentry.
   * We attach some content to make it easier to debug.
   */
  fastify.setErrorHandler(async (error, request, reply) => {
    // We don't report rate-limit errors to Sentry.
    if (reply.statusCode === 429) {
      reply.send(error);
      return;
    }

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
