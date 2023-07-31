import { z } from 'zod';
import { prismaClient } from '@/lib/prisma';
import { router, procedure } from '../trpc';
import { normalizePost, normalizeProfile } from '../utils';

export const postRouter = router({
  postGet: procedure
    .input(
      z.object({
        id: z.string(),
      }),
    )
    .query(async ({ input }) => {
      const post = await prismaClient.post.findUnique({
        where: {
          stream_id: input.id,
        },
      });

      return post ? normalizePost(post) : null;
    }),

  postList: procedure
    .input(
      z.object({
        did: z.string().optional(),
        status: z.enum(['DRAFT', 'PUBLISHED']).optional(),
        limit: z.number().min(1).max(100).optional(),
        cursor: z.string().optional(),
      }),
    )
    .query(async ({ input }) => {
      const limit = input.limit ?? 50;
      const posts = await prismaClient.post.findMany({
        where: {
          controller_did: input.did ?? undefined,
          stream_content: input.status
            ? {
                path: ['status'],
                equals: input.status,
              }
            : undefined,
        },
        // Get an extra item at the end which we'll use as next cursor
        take: limit + 1,
        cursor: input.cursor ? { stream_id: input.cursor } : undefined,
        orderBy: {
          created_at: 'desc',
        },
      });

      let nextCursor: typeof input.cursor | undefined = undefined;
      if (posts.length > limit) {
        const nextItem = posts.pop();
        nextCursor = nextItem!.stream_id;
      }

      const dids = posts.map((post) => post.controller_did);

      const profiles = await prismaClient.profile.findMany({
        where: {
          controller_did: {
            in: dids,
          },
        },
      });

      return {
        nextCursor,
        items: posts.map((post) => {
          const profile = profiles.find(
            (profile) => profile.controller_did === post.controller_did,
          );

          return {
            ...normalizePost(post),
            profile: profile ? normalizeProfile(profile) : undefined,
          };
        }),
      };
    }),

  postsNumbers: procedure
    .input(
      z.object({
        did: z.string(),
      }),
    )
    .query(async ({ input }) => {
      const [nbDrafts, nbPublished] = await Promise.all([
        prismaClient.post.count({
          where: {
            controller_did: input.did,
            stream_content: {
              path: ['status'],
              equals: 'DRAFT',
            },
          },
        }),
        prismaClient.post.count({
          where: {
            controller_did: input.did,
            stream_content: {
              path: ['status'],
              equals: 'PUBLISHED',
            },
          },
        }),
      ]);

      return {
        nbDrafts,
        nbPublished,
        nbTotal: nbDrafts + nbPublished,
      };
    }),
});
