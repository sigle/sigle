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
  // Gather all unique user addresses from the event data to create missing users
  const userAddresses = new Set<string>();
  userAddresses.add(data.sender);
  for (const event of data.nftMintEvents) {
    userAddresses.add(event.recipient);
  }

  const existingUsers = await prisma.user.findMany({
    where: {
      id: {
        in: Array.from(userAddresses),
      },
    },
    select: {
      id: true,
    },
  });

  const existingUserIds = new Set(existingUsers.map((user) => user.id));

  // Create any users that don't exist yet
  const usersToCreate = Array.from(userAddresses)
    .filter((address) => !existingUserIds.has(address))
    .map((address) => ({
      id: address,
    }));

  if (usersToCreate.length > 0) {
    await prisma.user.createMany({
      data: usersToCreate,
      skipDuplicates: true,
    });
  }

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

  for (const event of data.nftMintEvents) {
    const postNftData = {
      id: `${updatedPost.id}-${event.asset_identifier}`,
      minterId: data.sender,
      ownerId: event.recipient,
      postId: updatedPost.id,
      createdAt: data.timestamp,
    };
    await prisma.postNft.upsert({
      where: {
        id: `${updatedPost.id}-${event.asset_identifier}`,
      },
      update: postNftData,
      create: postNftData,
    });
  }

  consola.info("post.mint", {
    id: updatedPost.id,
    quantity: data.quantity,
  });
};
