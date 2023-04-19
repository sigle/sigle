import { Prisma } from '@prisma/client';
import { CeramicPost, CeramicProfile } from '@/types/ceramic';

export const normalizePost = (dbPost: {
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

export const normalizeProfile = (dbProfile: {
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
