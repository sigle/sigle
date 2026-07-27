import { matchError } from "better-result";
import { z } from "zod";
import { consola } from "@/lib/consola";
import { getMetadataFromUri } from "@/lib/metadata";
import { prisma } from "@/lib/prisma";
import { generateImageBlurhashJob } from "../../generate-image-blurhash";
import { indexOtsForPost } from "./index-ots";

export const indexerPublishPostSchema = z.object({
  action: z.literal("indexer-publish-post"),
  data: z.object({
    txId: z.string(),
    rootTxId: z.string().optional(),
    blockHeight: z.number(),
    author: z.string(),
    uri: z.string(),
    createdAt: z.coerce.date(),
  }),
});

export const executePublishPostJob = async (
  data: z.TypeOf<typeof indexerPublishPostSchema>["data"],
) => {
  const metadataResult = await getMetadataFromUri(data.uri);

  if (metadataResult.isErr()) {
    const message = matchError(metadataResult.error, {
      MetadataFetchFailedError: (e) => `Failed to fetch metadata: ${e.error}`,
      InvalidMetadataError: (e) => `Metadata validation failed: ${e.error}`,
      InvalidSignatureError: (e) =>
        `Metadata signature validation failed: ${e.error}`,
      UnhandledException: (e) => `Unhandled exception: ${e.message}`,
    });
    consola.error("Can't process metadata", {
      txId: data.txId,
      uri: data.uri,
      author: data.author,
      error: message,
    });
    return;
  }
  const metadata = metadataResult.value;

  const existingPostWithSignature = await prisma.post.findUnique({
    select: {
      id: true,
      txId: true,
    },
    where: {
      signature: metadata.signature,
    },
  });
  if (
    existingPostWithSignature &&
    existingPostWithSignature.txId !== data.txId
  ) {
    consola.warn(
      "Signature already indexed under a different post ID, skipping replay",
      {
        txId: data.txId,
        existingTxId: existingPostWithSignature.txId,
        signature: metadata.signature,
      },
    );
    return;
  }

  let shouldProcessImage = false;
  const targetPostId = data.rootTxId || data.txId;

  await prisma.$transaction(async (tx) => {
    const userId = data.author;
    const post = await tx.post.findUnique({
      select: {
        id: true,
        txId: true,
        coverImageId: true,
      },
      where: {
        id: targetPostId,
      },
    });

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

    const isNewTx = !post || post.txId !== data.txId;

    const updatedPost = post
      ? await tx.post.update({
          where: {
            id: targetPostId,
          },
          data: {
            txId: data.txId,
            version: metadata.version,
            blockHeight: data.blockHeight,
            signature: metadata.signature,

            // Metadata fields
            metadataUri: data.uri,
            title: metadata.title,
            content: metadata.content,
            metaTitle: metadata.metaTitle ?? null,
            metaDescription: metadata.metaDescription ?? null,
            excerpt: metadata.excerpt,
            tags: metadata.tags,
            canonicalUri: metadata.canonicalUri ?? null,
            ...(isNewTx
              ? {
                  revisionsCount: {
                    increment: 1,
                  },
                }
              : {}),
          },
        })
      : await tx.post.create({
          data: {
            id: targetPostId,
            txId: data.txId,
            version: metadata.version,
            blockHeight: data.blockHeight,
            signature: metadata.signature,
            userId,
            createdAt: new Date(data.createdAt),

            // Metadata fields
            metadataUri: data.uri,
            title: metadata.title,
            content: metadata.content,
            metaTitle: metadata.metaTitle,
            metaDescription: metadata.metaDescription,
            excerpt: metadata.excerpt,
            tags: metadata.tags,
            canonicalUri: metadata.canonicalUri,
            revisionsCount: 1,
          },
        });

    await tx.postRevision.upsert({
      where: {
        postId_txId: {
          postId: targetPostId,
          txId: data.txId,
        },
      },
      update: {},
      create: {
        postId: targetPostId,
        txId: data.txId,
        createdAt: new Date(data.createdAt),
      },
    });

    // Only reprocess the image if it changed
    if (metadata.coverImage && post?.coverImageId !== metadata.coverImage.url) {
      shouldProcessImage = true;
    }

    if (shouldProcessImage && metadata.coverImage) {
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

  if (shouldProcessImage && metadata.coverImage) {
    await generateImageBlurhashJob.emit({
      imageId: metadata.coverImage.url,
    });
  }

  await indexOtsForPost({
    postId: targetPostId,
    txId: data.txId,
  });

  consola.info("post.publishPost", {
    id: metadata.id,
    txId: data.txId,
    author: data.author,
  });
};
