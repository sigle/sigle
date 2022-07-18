import { prisma } from '../../prisma';

export * from './user';

export const TestBaseDB = {
  /**
   * After tests are done, clean up the database
   */
  cleanup: async () => {
    await prisma.subscription.deleteMany({});
    await prisma.follows.deleteMany({});
    await prisma.user.deleteMany({});
  },
};
