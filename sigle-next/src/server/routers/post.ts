import { Prisma } from '@prisma/client';
import { prismaClient } from '@/lib/prisma';
import { CeramicPost, CeramicProfile } from '@/types/ceramic';
import { router, procedure } from '../trpc';

const normalizePost = (dbPost: {
  stream_id: string;
  created_at: Date;
  stream_content: Prisma.JsonValue;
  controller_did: string;
}) => {
  return {
    ...((dbPost.stream_content as unknown as CeramicPost) ?? {}),
    id: dbPost.stream_id,
    did: dbPost.controller_did,
    createdAt: dbPost.created_at,
  };
};

const normalizeProfile = (dbProfile: {
  stream_id: string;
  created_at: Date;
  stream_content: Prisma.JsonValue;
  controller_did: string;
}) => {
  return {
    ...((dbProfile.stream_content as unknown as CeramicProfile) ?? {}),
    id: dbProfile.stream_id,
    did: dbProfile.controller_did,
    createdAt: dbProfile.created_at,
  };
};

export const postRouter = router({
  postList: procedure.query(async () => {
    const posts = await prismaClient.post.findMany({
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
