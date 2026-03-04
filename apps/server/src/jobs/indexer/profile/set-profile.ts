import { ProfileMetadataSchema } from "@sigle/sdk";
import { z } from "zod";
import { env } from "~/env";
import { consola } from "~/lib/consola";
import { prisma } from "~/lib/prisma";
import { generateImageBlurhashJob } from "../../generate-image-blurhash";

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
  const response = await fetch(`${env.ARWEAVE_GATEWAY_URL}/${arweaveTxId}`);
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
  } = profileMetadata.data.content;

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

  if (
    profileMetadata.data.content.picture ||
    profileMetadata.data.content.coverPicture
  ) {
    // We do a separate update query here as for some reason prisma doesn't let us update the relationship in the upsert
    await prisma.profile.update({
      where: {
        id: data.address,
      },
      data: {
        pictureUri: profileMetadata.data.content.picture
          ? {
              connectOrCreate: {
                where: {
                  id: profileMetadata.data.content.picture,
                },
                create: {
                  id: profileMetadata.data.content.picture,
                  mimeType: "unknown",
                },
              },
            }
          : undefined,
        coverPictureUri: profileMetadata.data.content.coverPicture
          ? {
              connectOrCreate: {
                where: {
                  id: profileMetadata.data.content.coverPicture,
                },
                create: {
                  id: profileMetadata.data.content.coverPicture,
                  mimeType: "unknown",
                },
              },
            }
          : undefined,
      },
    });

    if (profileMetadata.data.content.picture) {
      await generateImageBlurhashJob.emit({
        imageId: profileMetadata.data.content.picture,
      });
    }

    if (profileMetadata.data.content.coverPicture) {
      await generateImageBlurhashJob.emit({
        imageId: profileMetadata.data.content.coverPicture,
      });
    }
  }

  consola.info("profile.setProfile", {
    id: data.address,
    uri: data.uri,
  });
};
