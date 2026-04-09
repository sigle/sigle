import { defineEventHandler, readBody } from "nitro/h3";
import { prisma } from "@/lib/prisma";

export default defineEventHandler(async (event) => {
  if (!import.meta.test) {
    throw new Error("Not available outside test mode");
  }

  const body = await readBody(event);
  const { operation } = body as {
    operation: string;
    data?: Record<string, unknown>;
  };

  switch (operation) {
    case "reset": {
      await prisma.$executeRaw`
        TRUNCATE TABLE
          "post_nft",
          "minter_fixed_price",
          "collectible",
          "post",
          "draft",
          "session",
          "account",
          "profile",
          "media_image",
          "verification",
          "user",
          "RateLimiterFlexible"
        CASCADE
      `;
      return { success: true };
    }

    case "createUser": {
      const now = new Date();
      const userId =
        ((body.data as Record<string, unknown>)?.id as string) ??
        "ST1PQHQKV0RJXZFY1DGX8MNSNYVE3VGZJSRTPGZGM";
      const profile = (body.data as Record<string, unknown>)?.profile as
        | Record<string, string>
        | undefined;
      const result = await prisma.user.create({
        data: {
          id: userId,
          flag: "NONE",
          createdAt: now,
          updatedAt: now,
          ...(profile && {
            profile: {
              create: {
                displayName: profile.displayName ?? "Test User",
                description: profile.description ?? "Test description",
                website: profile.website ?? "https://example.com",
                twitter: profile.twitter ?? "testuser",
                txId:
                  profile.txId ?? `0x${Math.random().toString(16).slice(2)}`,
                createdAt: now,
                updatedAt: now,
              },
            },
          }),
        },
        include: { profile: true },
      });
      return result;
    }

    case "createPost": {
      const now = new Date();
      const data = body.data as Record<string, unknown>;
      const result = await prisma.post.create({
        data: {
          id: (data.id as string) ?? `post-${Date.now()}`,
          version: "1.0.0",
          txId: `0x${Math.random().toString(16).slice(2)}`,
          blockHeight: 100,
          title: (data.title as string) ?? "Test Post",
          content: "Test content",
          excerpt: "Test excerpt",
          metadataUri: "ipfs://QmTest",
          createdAt: now,
          updatedAt: now,
          userId: data.userId as string,
        },
      });
      return result;
    }

    default:
      throw new Error(`Unknown operation: ${operation}`);
  }
});
