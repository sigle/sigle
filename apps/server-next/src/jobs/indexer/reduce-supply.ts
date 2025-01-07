import { z } from 'zod';
import { consola } from '~/lib/consola';
import { defineJob } from '~/lib/jobs';
import { prisma } from '~/lib/prisma';

export const indexerReduceSupplyJob = defineJob('indexer-reduce-supply')
  .input(
    z.object({
      address: z.string(),
      maxSupply: z.number(),
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
        maxSupply: job.data.maxSupply,
        openEdition: false,
      },
    });

    consola.debug('indexer.reduceSupply', {
      id: updatedPost.id,
      maxSupply: job.data.maxSupply,
    });
  });
