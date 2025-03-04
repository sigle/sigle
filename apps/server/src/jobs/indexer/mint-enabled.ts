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
  const updatedPost = await prisma.post.update({
    select: {
      id: true,
    },
    where: {
      address: data.address,
    },
    data: {
      enabled: data.enabled,
    },
  });

  consola.debug("post.mintEnabled", {
    id: updatedPost.id,
    enabled: data.enabled,
  });
};
