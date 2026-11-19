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
    uri: z.string(),
    blockHeight: z.number(),
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
      InvalidSignatureError: (e) => `Invalid signature: ${e.error}`,
      UnhandledException: (e) => `Unhandled exception: ${e.message}`,
    });

    consola.error("Can't process profile metadata", {
      txId: data.txId,
      uri: data.uri,
      error: message,
    });

    return;
  }

  const { metadata, recoveredAddress, signature } = metadataResult.value;

  // A signed profile can only ever update the profile of its signer, and a
  // signature that already belongs to another transaction is a replay.
  const existingProfileWithSignature = await prisma.profile.findUnique({
    select: {
      id: true,
      txId: true,
    },
    where: {
      signature,
    },
  });

  if (
    existingProfileWithSignature &&
    existingProfileWithSignature.txId !== data.txId
  ) {
    consola.warn("Skipping replayed profile metadata", {
      txId: data.txId,
      existingTxId: existingProfileWithSignature.txId,
      signature,
    });

    return;
  }

  const existingProfile = await prisma.profile.findUnique({
    select: {
      blockHeight: true,
    },
    where: {
      id: recoveredAddress,
    },
  });

  // Never let an older mined transaction overwrite a newer profile.
  if (
    existingProfile &&
    data.blockHeight > 0 &&
    existingProfile.blockHeight > data.blockHeight
  ) {
    consola.warn("Skipping stale profile metadata", {
      txId: data.txId,
      address: recoveredAddress,
      blockHeight: data.blockHeight,
      existingBlockHeight: existingProfile.blockHeight,
    });

    return;
  }

  const profileFields = {
    displayName: metadata.content.displayName,
    description: metadata.content.description,
    website: metadata.content.website,
    twitter: metadata.content.twitter,
  };

  // Ensure user exists
  const user = await prisma.user.findUnique({
    select: {
      id: true,
    },
    where: {
      id: recoveredAddress,
    },
  });

  if (!user) {
    await prisma.user.create({
      data: {
        id: recoveredAddress,
      },
    });
  }

  await prisma.profile.upsert({
    where: {
      id: recoveredAddress,
    },
    update: {
      ...profileFields,
      txId: data.txId,
      blockHeight: data.blockHeight,
      signature,
    },
    create: {
      ...profileFields,
      id: recoveredAddress,
      txId: data.txId,
      blockHeight: data.blockHeight,
      signature,
    },
  });

  if (metadata.content.picture || metadata.content.coverPicture) {
    // We do a separate update query here as for some reason prisma doesn't let us update the relationship in the upsert
    await prisma.profile.update({
      where: {
        id: recoveredAddress,
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

    // TODO only do if !== from previous value
    if (metadata.content.picture) {
      await generateImageBlurhashJob.emit({
        imageId: metadata.content.picture,
      });
    }

    // TODO only do if !== from previous value
    if (metadata.content.coverPicture) {
      await generateImageBlurhashJob.emit({
        imageId: metadata.content.coverPicture,
      });
    }
  }

  consola.info("profile.setProfile", {
    id: recoveredAddress,
    uri: data.uri,
    txId: data.txId,
  });
};
