import type { User, Profile, Post, Draft } from "@/__generated__/prisma/client";
import type { UserFlag } from "@/__generated__/prisma/enums";
import { prisma } from "@/lib/prisma";
import { createTestDatabase, type TestDatabase } from "@/test/database";

interface CreateTestUserOptions {
  id?: string;
  flag?: UserFlag;
  profile?: {
    displayName?: string;
    description?: string;
    website?: string;
    twitter?: string;
    txId?: string;
  };
}

export async function createTestUser(
  options: CreateTestUserOptions = {},
): Promise<User & { profile?: Profile | null }> {
  const now = new Date();
  const userId = options.id ?? "ST1PQHQKV0RJXZFY1DGX8MNSNYVE3VGZJSRTPGZGM";

  return prisma.user.create({
    data: {
      id: userId,
      flag: options.flag ?? "NONE",
      createdAt: now,
      updatedAt: now,
      ...(options.profile && {
        profile: {
          create: {
            displayName: options.profile.displayName ?? "Test User",
            description: options.profile.description ?? "Test description",
            website: options.profile.website ?? "https://example.com",
            twitter: options.profile.twitter ?? "testuser",
            txId:
              options.profile.txId ??
              `0x${Math.random().toString(16).slice(2)}`,
            createdAt: now,
            updatedAt: now,
          },
        },
      }),
    },
    include: {
      profile: true,
    },
  });
}

interface CreateTestPostOptions {
  id?: string;
  userId: string;
  title?: string;
  content?: string;
  excerpt?: string;
  txId?: string;
  metadataUri?: string;
  version?: string;
  blockHeight?: number;
}

export async function createTestPost(
  options: CreateTestPostOptions,
): Promise<Post> {
  const now = new Date();

  return prisma.post.create({
    data: {
      id: options.id ?? `post-${Date.now()}`,
      version: options.version ?? "1.0.0",
      txId: options.txId ?? `0x${Math.random().toString(16).slice(2)}`,
      blockHeight: options.blockHeight ?? 100,
      title: options.title ?? "Test Post",
      content: options.content ?? "Test content",
      excerpt: options.excerpt ?? "Test excerpt",
      metadataUri: options.metadataUri ?? "ipfs://QmTest",
      createdAt: now,
      updatedAt: now,
      userId: options.userId,
    },
  });
}

interface CreateTestDraftOptions {
  id?: string;
  userId: string;
  title?: string;
  content?: string;
}

export async function createTestDraft(
  options: CreateTestDraftOptions,
): Promise<Draft> {
  return prisma.draft.create({
    data: {
      id: options.id ?? `draft-${Date.now()}`,
      title: options.title ?? "Test Draft",
      content: options.content ?? "Test content",
      userId: options.userId,
    },
  });
}

export { createTestDatabase, type TestDatabase };
