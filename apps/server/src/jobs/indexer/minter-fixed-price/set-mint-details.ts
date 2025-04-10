import { z } from "zod";
import { consola } from "~/lib/consola";
import { prisma } from "~/lib/prisma";

export const indexerSetMintDetailsSchema = z.object({
  action: z.literal("indexer-set-mint-details"),
  data: z.object({
    address: z.string(),
    price: z.number(),
    startBlock: z.number(),
    endBlock: z.number(),
  }),
});

export const executeIndexerSetMintDetailsJob = async (
  data: z.TypeOf<typeof indexerSetMintDetailsSchema>["data"],
) => {
  await prisma.minterFixedPrice.update({
    where: { id: data.address },
    data: {
      price: data.price,
      startBlock: data.startBlock,
      endBlock: data.endBlock,
    },
  });

  consola.debug("post.setMintDetails", {
    id: data.address,
  });
};
