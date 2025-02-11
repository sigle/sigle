import { PrismaClient } from "@prisma/client";

const globalForPrisma = globalThis as unknown as { prisma: PrismaClient };

export const prisma = globalForPrisma.prisma || new PrismaClient();

if (process.env.NODE_ENV !== "production") globalForPrisma.prisma = prisma;

export const SELECT_PUBLIC_USER_FIELDS = {
  id: true,
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
