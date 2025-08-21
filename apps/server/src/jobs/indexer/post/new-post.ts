import { MAX_UINT, PostMetadataSchema } from "@sigle/sdk";
import { z } from "zod";
import { env } from "~/env";
import {
  createChainhook,
  createPredicate,
  getChainhooks,
  preparePredicate,
} from "~/lib/chainhook";
import { consola } from "~/lib/consola";
import { siglePostPrintPredicate } from "~/lib/predicates";
import { prisma } from "~/lib/prisma";
import { sigleClient } from "~/lib/sigle";
import { generateImageBlurhashJob } from "../../generate-image-blurhash";

function extractBaseTokenUri(contractString: string): string | null {
  const regex =
    /\(define-data-var base-token-uri \(string-ascii \d+\) "([^"]+)"\)/;
  const match = contractString.match(regex);
  return match ? match[1] : null;
}

function extractMaxSupply(contractString: string): bigint | null {
  const regex = /\(define-data-var max-supply uint u(\d+)\)/;
  const match = contractString.match(regex);
  return match ? BigInt(match[1]) : null;
}

function extractFixedPricingDetails(contractString: string): {
  price: bigint;
  startBlock: bigint;
  endBlock: bigint;
  createRefferer?: string;
} | null {
  const regex =
    /\(unwrap-panic \(as-contract \(contract-call\? '(.+?) init-mint-details u(\d+) u(\d+) u(\d+) (none|some .*)\)\)\)/;
  const match = contractString.match(regex);

  if (!match) return null;

  return {
    price: BigInt(match[2]),
    startBlock: BigInt(match[3]),
    endBlock: BigInt(match[4]),
    createRefferer: match[5] === "none" ? undefined : match[5],
  };
}

export async function getMetadataFromUri(baseTokenUri: string) {
  let url = baseTokenUri;
  if (baseTokenUri.startsWith("ar://")) {
    const arweaveTxId = baseTokenUri.replace("ar://", "");
    url = `https://arweave.net/${arweaveTxId}`;
  }
  const response = await fetch(url);
  const json = await response.json();

  // Verify data is correct
  const postMetadata = PostMetadataSchema.safeParse(json);
  if (!postMetadata.success) {
    throw new Error(`Invalid postV1: ${postMetadata.error}`);
  }
  const postData = postMetadata.data;

  const metaTitle = postData.content.attributes?.find(
    (attribute) => attribute.key === "meta-title",
  )?.value;
  const metaDescription = postData.content.attributes?.find(
    (attribute) => attribute.key === "meta-description",
  )?.value;
  const excerpt = postData.content.attributes?.find(
    (attribute) => attribute.key === "excerpt",
  )?.value;
  const canonicalUri = postData.content.attributes?.find(
    (attribute) => attribute.key === "canonical-uri",
  )?.value;

  const metadata = {
    id: postData.content.id,
    title: postData.content.title,
    content: postData.content.content,
    metaTitle,
    metaDescription,
    excerpt: excerpt || "",
    coverImage: postData.content.coverImage,
    tags: postData.content.tags,
    canonicalUri,
  };

  return metadata;
}

export const indexerNewPostSchema = z.object({
  action: z.literal("indexer-new-post"),
  data: z.object({
    address: z.string(),
    txId: z.string(),
    blockHeight: z.number(),
    version: z.number().min(1).max(1),
    contract: z.string(),
    sender: z.string(),
    createdAt: z.coerce.date(),
    isStreamingBlocks: z.boolean(),
  }),
});

export const executeNewPostJob = async (
  data: z.TypeOf<typeof indexerNewPostSchema>["data"],
) => {
  const baseTokenUri = extractBaseTokenUri(data.contract);
  if (!baseTokenUri || !baseTokenUri.startsWith("ar://")) {
    throw new Error(`Invalid baseTokenUri: ${baseTokenUri}`);
  }

  const maxSupply = extractMaxSupply(data.contract);
  if (maxSupply === null) {
    throw new Error(`Invalid maxSupply: ${maxSupply}`);
  }
  const openEdition = maxSupply === BigInt(MAX_UINT);

  // Verify that the contract matches the template
  const fixedPricingDetails = extractFixedPricingDetails(data.contract);
  if (!fixedPricingDetails) {
    throw new Error(`Invalid fixedPricingDetails: ${fixedPricingDetails}`);
  }
  const { contract } = sigleClient.generatePostContract({
    metadata: baseTokenUri,
    collectInfo: {
      amount: fixedPricingDetails.price,
      maxSupply: maxSupply,
    },
  });
  if (contract !== data.contract) {
    throw new Error(`Contract mismatch: ${data.txId}`);
  }

  const metadata = await getMetadataFromUri(baseTokenUri);

  await prisma.$transaction(async (tx) => {
    const userId = data.sender;
    const post = await tx.post.findUnique({
      select: {
        id: true,
        txId: true,
      },
      where: {
        id: metadata.id,
      },
    });
    if (post && post.txId !== data.txId) {
      throw new Error(
        `Post id ${metadata.id} already exists with txId ${post.txId}`,
      );
    }

    const user = await tx.user.findUnique({
      select: {
        id: true,
      },
      where: {
        id: userId,
      },
    });
    if (!user) {
      await tx.user.create({
        data: {
          id: userId,
        },
      });
    }

    const updatedPost = await tx.post.upsert({
      where: {
        id: metadata.id,
        txId: data.txId,
      },
      update: {
        txId: data.txId,
        version: data.version,
      },
      create: {
        id: metadata.id,
        address: data.address,
        txId: data.txId,
        version: data.version,
        userId,
        collected: 0,
        enabled: true,
        openEdition,
        maxSupply: maxSupply === BigInt(MAX_UINT) ? 0 : Number(maxSupply),
        createdAt: new Date(data.createdAt),

        // Metadata fields
        metadataUri: baseTokenUri,
        title: metadata.title,
        content: metadata.content,
        metaTitle: metadata.metaTitle,
        metaDescription: metadata.metaDescription,
        excerpt: metadata.excerpt,
        tags: metadata.tags,
        canonicalUri: metadata.canonicalUri,
      },
    });

    if (metadata.coverImage) {
      await tx.post.update({
        where: {
          id: updatedPost.id,
        },
        data: {
          coverImage: {
            connectOrCreate: {
              where: {
                id: metadata.coverImage.url,
              },
              create: {
                id: metadata.coverImage.url,
                mimeType: metadata.coverImage.type,
              },
            },
          },
        },
      });
    }

    return updatedPost;
  });

  // Delete the associated draft if there is one
  // No need for this to be in the transaction
  await prisma.draft.deleteMany({
    where: {
      txId: data.txId,
    },
  });

  // Process cover image if there is one
  if (metadata.coverImage) {
    await generateImageBlurhashJob.emit({
      imageId: metadata.coverImage.url,
    });
  }

  const chainhooks = await getChainhooks();
  const predicateName = `${env.SIGLE_ENV}-${env.STACKS_ENV}.${siglePostPrintPredicate.name}.${data.address}`;
  const hasContractDeploymentChainhook = chainhooks.find(
    (chainhook) => chainhook.name === predicateName,
  );
  if (!hasContractDeploymentChainhook) {
    const newPredicate = {
      ...siglePostPrintPredicate,
      name: predicateName,
    };
    newPredicate.networks.testnet.if_this.contract_identifier = data.address;
    // We add 1 here to skip the deployment block logs
    newPredicate.networks.testnet.start_block = data.blockHeight + 1;
    const response = await createChainhook(
      preparePredicate(createPredicate(newPredicate)),
    );
    consola.info(`new-post: Registered chainhook ${response.chainhookUuid}`);
  }

  consola.info("post.newPost", {
    id: metadata.id,
    txId: data.txId,
    address: data.address,
  });
};
