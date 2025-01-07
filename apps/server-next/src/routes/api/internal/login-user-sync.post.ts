import { z } from 'zod';
import { readValidatedBodyZod } from '~/lib/nitro';
import { prisma } from '~/lib/prisma';

const syncUserSchema = z.object({
  address: z.string(),
});

/**
 * Sync a user after login
 */
export default defineEventHandler(async (event) => {
  const { address } = await readValidatedBodyZod(event, syncUserSchema);

  const user = await prisma.user.upsert({
    where: {
      id: address,
    },
    create: {
      id: address,
      lastLoginAt: new Date(),
    },
    update: {
      id: address,
      lastLoginAt: new Date(),
    },
    select: {
      id: true,
    },
  });

  return {
    id: user.id,
  };
});
