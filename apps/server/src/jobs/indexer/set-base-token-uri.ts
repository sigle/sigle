import { z } from "zod";
import { consola } from "~/lib/consola";
import { prisma } from "~/lib/prisma";
import { generateImageBlurhashJob } from "../generate-image-blurhash";
import { getMetadataFromUri } from "./new-post";

export const indexerSetBaseTokenUriSchema = z.object({
  action: z.literal("indexer-set-base-token-uri"),
  data: z.object({
    address: z.string(),
    uri: z.string(),
  }),
});

export const executeIndexerSetBaseTokenUriJob = async (
  data: z.TypeOf<typeof indexerSetBaseTokenUriSchema>["data"],
) => {
  const metadata = await getMetadataFromUri(data.uri);

  const post = await prisma.post.findUnique({
    select: {
      id: true,
      coverImageId: true,
    },
    where: {
      address: data.address,
    },
  });
  if (!post) {
    throw new Error(`Post not found for address ${data.address}`);
  }

  await prisma.post.update({
    where: {
      id: post.id,
    },
    data: {
      metadataUri: data.uri,
      title: metadata.title,
      content: metadata.content,
      metaTitle: metadata.metaTitle,
      metaDescription: metadata.metaDescription,
      excerpt: metadata.excerpt,
      tags: metadata.tags,
    },
  });

  // Only reprocess the image if it changed
  if (metadata.coverImage && post.coverImageId !== metadata.coverImage.url) {
    await prisma.post.update({
      where: {
        id: post.id,
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

    await generateImageBlurhashJob.emit({
      imageId: metadata.coverImage.url,
    });
  }

  consola.debug("post.setBaseTokenUri", {
    id: post.id,
    uri: data.uri,
  });
};
