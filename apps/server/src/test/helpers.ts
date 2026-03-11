import type { UserFlag } from "~/__generated__/prisma/enums";
import { prisma } from "~/lib/prisma";

interface CreateTestUserOptions {
  id?: string;
  flag?: UserFlag;
}

/**
 * Create a test user
 */
export async function createTestUser(options: CreateTestUserOptions = {}) {
  const now = new Date();

  return prisma.user.create({
    data: {
      id: options.id ?? "ST1PQHQKV0RJXZFY1DGX8MNSNYVE3VGZJSRTPGZGM",
      flag: options.flag ?? "NONE",
      createdAt: now,
      updatedAt: now,
    },
  });
}
