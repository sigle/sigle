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
  const minterFixedPriceData = {
    id: data.address,
    price: data.price,
    startBlock: data.startBlock,
    endBlock: data.endBlock,
  };
  await prisma.minterFixedPrice.upsert({
    where: { id: data.address },
    update: minterFixedPriceData,
    create: minterFixedPriceData,
  });

  consola.debug("post.initMintDetails", {
    id: data.address,
    price: data.price,
  });
};
