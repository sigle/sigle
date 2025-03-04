import { z } from "zod";
import { consola } from "~/lib/consola";
import { prisma } from "~/lib/prisma";

export const indexerMintSchema = z.object({
  action: z.literal("indexer-mint"),
  data: z.object({
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
});

export const executeIndexerMintJob = async (
  data: z.TypeOf<typeof indexerMintSchema>["data"],
) => {
  const updatedPost = await prisma.post.update({
    select: {
      id: true,
    },
    where: {
      address: data.address,
    },
    data: {
      collected: {
        increment: data.quantity,
      },
    },
  });

  await prisma.postNft.createMany({
    data: data.nftMintEvents.map((event) => ({
      id: `${updatedPost.id}-${event.asset_identifier}`,
      minterId: data.sender,
      ownerId: event.recipient,
      postId: updatedPost.id,
      createdAt: data.timestamp,
    })),
  });

  consola.debug("post.mint", {
    id: updatedPost.id,
    quantity: data.quantity,
  });
};
