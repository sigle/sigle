import { prismaClient } from '@/lib/prisma';
import { z } from 'zod';
import { router, procedure } from '../trpc';
import { normalizePost, normalizeProfile } from '../utils';

export const postRouter = router({
  postList: procedure
    .input(
      z.object({
        did: z.string().optional(),
      })
    )
    .query(async ({ input }) => {
      const posts = await prismaClient.post.findMany({
        where: {
          controller_did: input.did ?? undefined,
        },
        orderBy: {
          created_at: 'desc',
        },
      });

      const dids = posts.map((post) => post.controller_did);

      const profiles = await prismaClient.profile.findMany({
        where: {
          controller_did: {
            in: dids,
          },
        },
      });

      return posts.map((post) => {
        const profile = profiles.find(
          (profile) => profile.controller_did === post.controller_did
        );

        return {
          ...normalizePost(post),
          profile: profile ? normalizeProfile(profile) : undefined,
        };
      });
    }),
});
