import { prisma } from '../../../prisma';

export const SubscriptionService = {
  getActiveSubscriptionByAddress: ({ address }: { address: string }) => {
    return prisma.subscription.findFirst({
      where: {
        user: { stacksAddress: address },
        status: 'ACTIVE',
      },
      select: {
        id: true,
        nftId: true,
      },
    });
  },
};
