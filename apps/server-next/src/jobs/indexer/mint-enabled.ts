import { z } from 'zod';
import { consola } from '~/lib/consola';
import { defineJob } from '~/lib/jobs';
import { prisma } from '~/lib/prisma';

export const indexerMintEnabledJob = defineJob('indexer-mint-enabled')
  .input(
    z.object({
      address: z.string(),
      enabled: z.boolean(),
    }),
  )
  .options({})
  .work(async (jobs) => {
    const job = jobs[0];
    const updatedPost = await prisma.post.update({
      select: {
        id: true,
      },
      where: {
        address: job.data.address,
      },
      data: {
        enabled: job.data.enabled,
      },
    });

    consola.debug('post.mintEnabled', {
      id: updatedPost.id,
      enabled: job.data.enabled,
    });
  });
