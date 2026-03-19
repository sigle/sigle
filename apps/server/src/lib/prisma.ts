import { PrismaPg } from "@prisma/adapter-pg";
import { PrismaClient } from "@/__generated__/prisma/client";

const globalForPrisma = globalThis as unknown as { prisma: PrismaClient };

function createPrismaClient() {
  const connectionString = process.env.DATABASE_URL;
  const adapter = new PrismaPg({ connectionString });
  return new PrismaClient({ adapter });
}

export let prisma = createPrismaClient();

/**
 * Replace the global prisma instance. Used by tests to point at the test database.
 */
export function setPrismaClient(client: PrismaClient) {
  prisma = client;
}

if (process.env.NODE_ENV !== "production") globalForPrisma.prisma = prisma;

export const SELECT_PUBLIC_USER_FIELDS = {
  id: true,
  flag: true,
  createdAt: true,
  updatedAt: true,
  profile: {
    select: {
      id: true,
      txId: true,
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
  title: true,
  content: true,
  metaTitle: true,
  metaDescription: true,
  coverImage: true,
  excerpt: true,
  tags: true,
  canonicalUri: true,
  txId: true,
  blockHeight: true,
  metadataUri: true,
  createdAt: true,
  updatedAt: true,
  // Relations
  minterFixedPrice: true,
  collectible: {
    select: {
      id: true,
      address: true,
      maxSupply: true,
      openEdition: true,
      collected: true,
      enabled: true,
    },
  },
};
