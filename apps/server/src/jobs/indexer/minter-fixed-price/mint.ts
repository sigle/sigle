import { z } from "zod";
import { consola } from "~/lib/consola";
import { prisma } from "~/lib/prisma";
import { stacksNetwork } from "~/lib/stacks";

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
  // Gather all unique wallet addresses from the event data to create missing users
  const walletAddresses = new Set<string>();
  walletAddresses.add(data.sender);
  for (const event of data.nftMintEvents) {
    walletAddresses.add(event.recipient);
  }

  // Look up existing users by wallet address
  const existingWallets = await prisma.walletAddress.findMany({
    where: {
      address: {
        in: Array.from(walletAddresses),
      },
      chainId: 1,
    },
    select: {
      address: true,
      userId: true,
    },
  });

  // Map from wallet address -> user ID
  const addressToUserId = new Map(
    existingWallets.map((w) => [w.address, w.userId]),
  );

  // Create any users that don't exist yet
  const addressesToCreate = Array.from(walletAddresses).filter(
    (address) => !addressToUserId.has(address),
  );

  for (const address of addressesToCreate) {
    const newUser = await prisma.user.create({
      data: {
        name: address,
        email: `${address}@user-sigle.io`,
        walletAddresses: {
          create: {
            address,
            chainId: stacksNetwork.chainId,
            isPrimary: true,
          },
        },
      },
    });
    addressToUserId.set(address, newUser.id);
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
    const minterId = addressToUserId.get(data.sender);
    const ownerId = addressToUserId.get(event.recipient);
    if (!minterId || !ownerId) {
      throw new Error(
        `User ID not found for minter ${data.sender} or owner ${event.recipient}`,
      );
    }
    const postNftData = {
      id: `${updatedPost.id}-${event.asset_identifier}`,
      minterId,
      ownerId,
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
