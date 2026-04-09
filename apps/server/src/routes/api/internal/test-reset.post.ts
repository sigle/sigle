import { defineEventHandler } from "nitro/h3";
import { prisma } from "@/lib/prisma";

export default defineEventHandler(async () => {
  if (!import.meta.test) {
    throw new Error("Not available outside test mode");
  }

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
});
