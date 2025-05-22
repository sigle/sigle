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
  const updatedPost = await prisma.post.update({
    select: {
      id: true,
    },
    where: {
      address: data.address,
    },
    data: {
      maxSupply: data.maxSupply,
      openEdition: false,
    },
  });

  consola.info("post.reduceSupply", {
    id: updatedPost.id,
    maxSupply: data.maxSupply,
  });
};
