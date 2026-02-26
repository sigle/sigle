import { z } from "zod";
import { consola } from "~/lib/consola";
import { prisma } from "~/lib/prisma";

export const indexerMintEnabledSchema = z.object({
  action: z.literal("indexer-mint-enabled"),
  data: z.object({
    address: z.string(),
    enabled: z.boolean(),
  }),
});

export const executeIndexerMintEnabledJob = async (
  data: z.TypeOf<typeof indexerMintEnabledSchema>["data"],
) => {
  const updatedCollectible = await prisma.collectible.update({
    where: {
      address: data.address,
    },
    data: {
      post: {
        update: {
          enabled: data.enabled,
        },
      },
    },
    select: {
      post: {
        select: {
          id: true,
        },
      },
    },
  });

  consola.info("post.mintEnabled", {
    id: updatedCollectible.post.id,
    enabled: data.enabled,
  });
};
