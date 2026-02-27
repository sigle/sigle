import { PostMetadataSchema } from "@sigle/sdk";
import { z } from "zod";
import { consola } from "~/lib/consola";
import { prisma } from "~/lib/prisma";
import { generateImageBlurhashJob } from "../../generate-image-blurhash";

export async function getMetadataFromUri(baseTokenUri: string) {
  let url = baseTokenUri;
  if (baseTokenUri.startsWith("ar://")) {
    const arweaveTxId = baseTokenUri.replace("ar://", "");
    url = `https://arweave.net/${arweaveTxId}`;
  }
  // TODO error handling fetch retry etc
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
  const metadata = await getMetadataFromUri(data.uri);
  // TODO fix the version from the SDK metadata
  const version = 1;

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
