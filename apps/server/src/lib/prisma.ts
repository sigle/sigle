import { PrismaPg } from "@prisma/adapter-pg";
import { PrismaClient } from "~/__generated__/prisma/client";

const globalForPrisma = globalThis as unknown as { prisma: PrismaClient };

const adapter = new PrismaPg({
  connectionString: process.env.DATABASE_URL,
});
export const prisma = globalForPrisma.prisma || new PrismaClient({ adapter });

if (process.env.NODE_ENV !== "production") globalForPrisma.prisma = prisma;

export const SELECT_PUBLIC_USER_FIELDS = {
  id: true,
  flag: true,
  createdAt: true,
  updatedAt: true,
  profile: {
    select: {
      id: true,
      displayName: true,
      description: true,
      website: true,
      twitter: true,
      pictureUri: true,
      coverPictureUri: true,
    },
  },
};

export const SELECT_PUBLIC_POST_FIELDS = {
  id: true,
  address: true,
  title: true,
  content: true,
  metaTitle: true,
  metaDescription: true,
  coverImage: true,
  excerpt: true,
  tags: true,
  canonicalUri: true,
  txId: true,
  maxSupply: true,
  collected: true,
  openEdition: true,
  metadataUri: true,
  createdAt: true,
  updatedAt: true,
  // Relations
  minterFixedPrice: true,
};
