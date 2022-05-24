import Fastify, { FastifyServerOptions, FastifyLoggerInstance } from 'fastify';
import { Server } from 'http';
import * as Sentry from '@sentry/node';
import { createAnalyticsHistoricalEndpoint } from './api/modules/analytics/historical';
import { createAnalyticsReferrersEndpoint } from './api/modules/analytics/referrers';

export const buildFastifyServer = (
  opts: FastifyServerOptions<Server, FastifyLoggerInstance> = {}
) => {
  const fastify = Fastify(opts);

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
