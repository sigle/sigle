import { z } from "zod";
import { consola } from "~/lib/consola";
import { defineJob } from "~/lib/jobs";
import { prisma } from "~/lib/prisma";

export const indexerMintJob = defineJob("indexer-mint")
  .input(
    z.object({
      address: z.string(),
      quantity: z.number(),
      nftMintEvents: z.array(
        z.object({
          asset_identifier: z.string(),
          recipient: z.string(),
        }),
      ),
      sender: z.string(),
      timestamp: z.coerce.date(),
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
        collected: {
          increment: job.data.quantity,
        },
      },
    });

    await prisma.postNft.createMany({
      data: job.data.nftMintEvents.map((event) => ({
        id: `${updatedPost.id}-${event.asset_identifier}`,
        minterId: job.data.sender,
        ownerId: event.recipient,
        postId: updatedPost.id,
        createdAt: job.data.timestamp,
      })),
    });

    consola.debug("post.mint", {
      id: updatedPost.id,
      quantity: job.data.quantity,
    });
  });
