import { z } from 'zod';
import { prismaClient } from '@/lib/prisma';
import { router, procedure } from '../trpc';
import { normalizeProfile } from '../utils';

export const userRouter = router({
  userProfile: procedure
    .input(
      z.object({
        did: z.string(),
      }),
    )
    .query(async ({ input }) => {
      const profile = await prismaClient.profile.findFirst({
        where: {
          controller_did: input.did,
        },
      });

      if (!profile) {
        return null;
      }

      return normalizeProfile(profile);
    }),
});
