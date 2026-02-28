import { matchError } from "better-result";
import { z } from "zod";
import { consola } from "~/lib/consola";
import { getMetadataFromUri } from "~/lib/metadata";
import { prisma } from "~/lib/prisma";
import { generateImageBlurhashJob } from "../../generate-image-blurhash";

export const indexerPublishPostSchema = z.object({
  action: z.literal("indexer-publish-post"),
  data: z.object({
    txId: z.string(),
    author: z.string(),
    uri: z.string(),
    createdAt: z.coerce.date(),
  }),
});

export const executePublishPostJob = async (
  data: z.TypeOf<typeof indexerPublishPostSchema>["data"],
) => {
  const metadataResult = await getMetadataFromUri(data.uri);
  // TODO fix the version from the SDK metadata
  const version = 1;

  if (metadataResult.isErr()) {
    const message = matchError(metadataResult.error, {
      MetadataFetchFailedError: (e) => `Failed to fetch metadata: ${e.error}`,
      InvalidMetadataError: (e) => `Metadata validation failed: ${e.error}`,
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

  let shouldProcessImage = false;
  await prisma.$transaction(async (tx) => {
    const userId = data.author;
    const post = await tx.post.findUnique({
      select: {
        id: true,
        txId: true,
        coverImageId: true,
      },
      where: {
        id: metadata.id,
      },
    });
    if (post && post.txId !== data.txId) {
      console.warn(
        `Post id ${metadata.id} already exists with a different txId. Existing txId: ${post.txId}, new txId: ${data.txId}`,
      );
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
        version: version,
      },
      create: {
        id: metadata.id,
        txId: data.txId,
        version: version,
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

  consola.info("post.publishPost", {
    id: metadata.id,
    txId: data.txId,
    author: data.author,
  });
};
