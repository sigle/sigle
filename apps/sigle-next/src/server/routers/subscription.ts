import { NonFungibleTokensApi } from '@stacks/blockchain-api-client';
import { prismaClient } from '@/lib/prisma';
import { postHogClient } from '@/lib/posthog';
import { router, authedProcedure } from '../trpc';

const NUMBER_NFTS_BASIC = 1;
const NUMBER_NFTS_PUBLISHER = 3;

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

  /**
   * Upgrade the current active subscription based on the number of NFTs the user owns.
   */
  upgradeWithNFT: authedProcedure.mutation(async ({ ctx }) => {
    const userId = ctx.session.user.id;
    const user = await prismaClient.user.findUniqueOrThrow({
      select: {
        address: true,
      },
      where: { id: userId },
    });

    const nftApi = new NonFungibleTokensApi();
    const nftHoldings = await nftApi.getNftHoldings({
      principal: user.address,
      assetIdentifiers: [
        'SP2X0TZ59D5SZ8ACQ6YMCHHNR2ZN51Z32E2CJ173.the-explorer-guild::The-Explorer-Guild',
      ],
    });
    const numberNfts = nftHoldings.total;
    if (numberNfts < NUMBER_NFTS_BASIC) {
      return false;
    }

    const newSubscriptionPlan =
      numberNfts >= NUMBER_NFTS_PUBLISHER ? 'PUBLISHER' : 'BASIC';

    let activeSubscription = await prismaClient.subscription.findFirst({
      select: {
        id: true,
        plan: true,
      },
      where: {
        userId: userId,
        status: 'ACTIVE',
      },
    });
    // No need to update the subscription as it's already active and has the correct plan.
    if (activeSubscription && activeSubscription.plan === newSubscriptionPlan) {
      return false;
    }

    // Mark the current active subscription as cancelled.
    if (activeSubscription) {
      await prismaClient.subscription.update({
        select: {
          id: true,
        },
        where: {
          id: activeSubscription.id,
        },
        data: {
          status: 'INACTIVE',
        },
      });
    }

    const newSubscription = await prismaClient.subscription.create({
      select: {
        id: true,
      },
      data: {
        userId: userId,
        status: 'ACTIVE',
        plan: newSubscriptionPlan,
      },
    });

    postHogClient.capture({
      distinctId: userId,
      event: 'subscription created',
      properties: {
        subscriptionId: newSubscription.id,
        numberNfts,
        plan: newSubscriptionPlan,
        previousSubscriptionId: activeSubscription?.id,
      },
    });

    await postHogClient.shutdownAsync();

    return true;
  }),
});
