import { z } from "zod";
import { consola } from "~/lib/consola";
import { prisma } from "~/lib/prisma";

export const indexerReduceSupplySchema = z.object({
  action: z.literal("indexer-reduce-supply"),
  data: z.object({
    address: z.string(),
    maxSupply: z.number(),
  }),
});

export const executeIndexerReduceSupplyJob = async (
  data: z.TypeOf<typeof indexerReduceSupplySchema>["data"],
) => {
  const updatedCollectible = await prisma.collectible.update({
    where: {
      address: data.address,
    },
    data: {
      maxSupply: data.maxSupply,
      openEdition: false,
    },
    select: {
      post: {
        select: {
          id: true,
        },
      },
    },
  });

  consola.info("post.reduceSupply", {
    id: updatedCollectible.post.id,
    maxSupply: data.maxSupply,
  });
};
