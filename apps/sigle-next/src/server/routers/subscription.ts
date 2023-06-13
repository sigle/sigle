import { prismaClient } from '@/lib/prisma';
import { router, authedProcedure } from '../trpc';

export const subscriptionRouter = router({
  /**
   * Get the current active subscription for the logged in user.
   */
  getActive: authedProcedure.query(async ({ ctx }) => {
    // const userId = ctx.session.user.id;
  }),
});
