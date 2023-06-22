import { Prisma } from '@prisma/client';
import * as cheerio from 'cheerio';
import { CeramicPost, CeramicProfile } from '@/types/ceramic';

export const normalizePost = (dbPost: {
  stream_id: string;
  created_at: Date;
  stream_content: Prisma.JsonValue;
  controller_did: string;
}) => {
  const content = (dbPost.stream_content as unknown as CeramicPost) ?? {};

  let excerpt;
  if (content.content) {
    const $ = cheerio.load(content.content);
    const text = $.root().text().trim();
    excerpt = text.substring(0, 350);
  }

  return {
    ...content,
    excerpt,
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
  const content = (dbProfile.stream_content as unknown as CeramicProfile) ?? {};
  return {
    ...content,
    id: dbProfile.stream_id,
    did: dbProfile.controller_did,
    createdAt: dbProfile.created_at,
  };
};
