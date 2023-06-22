import * as trpcNext from '@trpc/server/adapters/next';
import * as Sentry from '@sentry/nextjs';
import { appRouter } from '@/server/routers/_app';
import { createContext } from '@/server/context';

export default trpcNext.createNextApiHandler({
  router: appRouter,
  createContext,

  /**
   * @link https://trpc.io/docs/error-handling
   */
  onError({ error }) {
    if (error.code === 'INTERNAL_SERVER_ERROR') {
      console.error(error);
      Sentry.captureException(error);

      // Hide internal server errors from the client
      error.message = 'Internal server error';
    }
  },

  batching: {
    enabled: true,
  },
});
