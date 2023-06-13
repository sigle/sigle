import { prismaClient } from '@/lib/prisma';
import { router, authedProcedure } from '../trpc';

export const subscriptionRouter = router({
  /**
   * Get the current active subscription for the logged in user.
   */
  getActive: authedProcedure.query(async ({ ctx }) => {
    const userId = ctx.session.user.id;
    const activeSubscription = await prismaClient.subscription.findFirst({
      select: {
        id: true,
        plan: true,
      },
      where: {
        userId,
        status: 'ACTIVE',
      },
    });
    return activeSubscription;
  }),
});
