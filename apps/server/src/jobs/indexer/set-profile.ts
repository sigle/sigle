import { ProfileMetadataSchema } from "@sigle/sdk";
import { z } from "zod";
import { consola } from "~/lib/consola";
import { prisma } from "~/lib/prisma";
import { generateImageBlurhashJob } from "../generate-image-blurhash";

export const indexerSetProfileSchema = z.object({
  action: z.literal("indexer-set-profile"),
  data: z.object({
    address: z.string(),
    uri: z.string(),
  }),
});

export const executeIndexerSetProfileJob = async (
  data: z.TypeOf<typeof indexerSetProfileSchema>["data"],
) => {
  // Fetch data from Arweave
  const arweaveTxId = data.uri.replace("ar://", "");
  const response = await fetch(`https://arweave.net/${arweaveTxId}`);
  const json = await response.json();

  // Verify data is correct
  const profileMetadata = ProfileMetadataSchema.safeParse(json);
  if (!profileMetadata.success) {
    throw new Error(`Invalid profile: ${profileMetadata.error}`);
  }
  const {
    id: _,
    picture: __,
    coverPicture: ____,
    ...metadataWithoutId
  } = profileMetadata.data;

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

  if (profileMetadata.data.picture || profileMetadata.data.coverPicture) {
    // We do a separate update query here as for some reason prisma doesn't let us update the relationship in the upsert
    await prisma.profile.update({
      where: {
        id: data.address,
      },
      data: {
        pictureUri: profileMetadata.data.picture
          ? {
              connectOrCreate: {
                where: {
                  id: profileMetadata.data.picture,
                },
                create: {
                  id: profileMetadata.data.picture,
                  mimeType: "unknown",
                },
              },
            }
          : undefined,
        coverPictureUri: profileMetadata.data.coverPicture
          ? {
              connectOrCreate: {
                where: {
                  id: profileMetadata.data.coverPicture,
                },
                create: {
                  id: profileMetadata.data.coverPicture,
                  mimeType: "unknown",
                },
              },
            }
          : undefined,
      },
    });

    if (profileMetadata.data.picture) {
      await generateImageBlurhashJob.emit({
        imageId: profileMetadata.data.picture,
      });
    }

    if (profileMetadata.data.coverPicture) {
      await generateImageBlurhashJob.emit({
        imageId: profileMetadata.data.coverPicture,
      });
    }
  }

  consola.debug("profile.setProfile", {
    id: data.address,
    uri: data.uri,
  });
};
