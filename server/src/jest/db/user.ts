import { prisma } from '../../prisma';

export const TestDBUser = {
  seedUser: async ({ stacksAddress }: { stacksAddress: string }) => {
    const user = await prisma.user.create({
      data: {
        stacksAddress,
      },
    });
    return user;
  },

  seedUserWithSubscription: async ({
    stacksAddress,
    subscription = {
      nftId: 42,
    },
  }: {
    stacksAddress: string;
    subscription?: {
      nftId: number;
    };
  }) => {
    const user = await prisma.user.create({
      data: {
        stacksAddress,
        subscriptions: {
          create: {
            nftId: subscription.nftId,
            status: 'ACTIVE',
          },
        },
      },
    });
    return user;
  },
};
