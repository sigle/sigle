import { MAX_UINT } from "@sigle/sdk";
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
  const post = await prisma.post.findUniqueOrThrow({
    where: { address: data.address },
  });

  let endBlock = BigInt(data.endBlock);
  // This is required, idk why the chainhook value has + 1 to MAX_UINT
  if (endBlock === MAX_UINT + BigInt(1)) {
    endBlock = 0n;
  }
  await prisma.minterFixedPrice.update({
    where: { id: post.id },
    data: {
      price: data.price,
      startBlock: BigInt(data.startBlock),
      endBlock,
    },
  });

  consola.debug("post.setMintDetails", {
    id: data.address,
  });
};
