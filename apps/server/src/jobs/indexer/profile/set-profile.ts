import { matchError } from "better-result";
import { z } from "zod";
import { consola } from "@/lib/consola";
import { getProfileMetadataFromUri } from "@/lib/metadata";
import { prisma } from "@/lib/prisma";
import { generateImageBlurhashJob } from "../../generate-image-blurhash";

export const indexerSetProfileSchema = z.object({
  action: z.literal("indexer-set-profile"),
  data: z.object({
    txId: z.string(),
    address: z.string(),
    uri: z.string(),
  }),
});

export const executeIndexerSetProfileJob = async (
  data: z.TypeOf<typeof indexerSetProfileSchema>["data"],
) => {
  const metadataResult = await getProfileMetadataFromUri(data.uri);

  if (metadataResult.isErr()) {
    const message = matchError(metadataResult.error, {
      MetadataFetchFailedError: (e) => `Failed to fetch metadata: ${e.error}`,
      InvalidMetadataError: (e) => `Metadata validation failed: ${e.error}`,
      UnhandledException: (e) => `Unhandled exception: ${e.message}`,
    });
    consola.error("Can't process profile metadata", {
      txId: data.txId,
      uri: data.uri,
      author: data.address,
      error: message,
    });
    return;
  }
  const metadata = metadataResult.value;

  const {
    id: _,
    picture: __,
    coverPicture: ____,
    ...metadataWithoutId
  } = metadata.content;

  // Ensure user exists
  const user = await prisma.user.findUnique({
    select: {
      id: true,
    },
    where: {
      id: data.address,
    },
  });
  if (!user) {
    await prisma.user.create({
      data: {
        id: data.address,
      },
    });
  }

  await prisma.profile.upsert({
    where: {
      id: data.address,
    },
    update: {
      ...metadataWithoutId,
    },
    create: {
      ...metadataWithoutId,
      id: data.address,
    },
  });

  if (metadata.content.picture || metadata.content.coverPicture) {
    // We do a separate update query here as for some reason prisma doesn't let us update the relationship in the upsert
    await prisma.profile.update({
      where: {
        id: data.address,
      },
      data: {
        pictureUri: metadata.content.picture
          ? {
              connectOrCreate: {
                where: {
                  id: metadata.content.picture,
                },
                create: {
                  id: metadata.content.picture,
                  mimeType: "unknown",
                },
              },
            }
          : undefined,
        coverPictureUri: metadata.content.coverPicture
          ? {
              connectOrCreate: {
                where: {
                  id: metadata.content.coverPicture,
                },
                create: {
                  id: metadata.content.coverPicture,
                  mimeType: "unknown",
                },
              },
            }
          : undefined,
      },
    });

    if (metadata.content.picture) {
      await generateImageBlurhashJob.emit({
        imageId: metadata.content.picture,
      });
    }

    if (metadata.content.coverPicture) {
      await generateImageBlurhashJob.emit({
        imageId: metadata.content.coverPicture,
      });
    }
  }

  consola.info("profile.setProfile", {
    id: data.address,
    uri: data.uri,
    txId: data.txId,
  });
};
