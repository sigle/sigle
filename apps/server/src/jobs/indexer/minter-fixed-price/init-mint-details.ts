import { MAX_UINT } from "@sigle/sdk";
import { z } from "zod";
import { consola } from "~/lib/consola";
import { prisma } from "~/lib/prisma";

export const indexerInitMintDetailsSchema = z.object({
  action: z.literal("indexer-init-mint-details"),
  data: z.object({
    address: z.string(),
    price: z.number(),
    startBlock: z.number(),
    endBlock: z.number(),
  }),
});

export const executeIndexerInitMintDetailsJob = async (
  data: z.TypeOf<typeof indexerInitMintDetailsSchema>["data"],
) => {
  const collectible = await prisma.collectible.findUniqueOrThrow({
    where: { address: data.address },
    select: {
      post: {
        select: {
          id: true,
        },
      },
    },
  });
  const postId = collectible.post.id;

  let endBlock = BigInt(data.endBlock);
  // This is required, idk why the chainhook value has + 1 to MAX_UINT
  if (endBlock === MAX_UINT + BigInt(1)) {
    endBlock = 0n;
  }
  const minterFixedPriceData = {
    id: postId,
    price: data.price,
    startBlock: BigInt(data.startBlock),
    endBlock,
  };
  await prisma.minterFixedPrice.upsert({
    where: { id: postId },
    update: minterFixedPriceData,
    create: minterFixedPriceData,
  });

  // Reset the count to 0 in case we are reindexing
  await prisma.post.update({
    where: {
      id: postId,
    },
    data: {
      collected: 0,
    },
  });

  consola.info("post.initMintDetails", {
    id: data.address,
    price: data.price,
  });
};
