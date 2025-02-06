import { ProfileMetadataSchema } from '@sigle/sdk';
import { z } from 'zod';
import { consola } from '~/lib/consola';
import { defineJob } from '~/lib/jobs';
import { prisma } from '~/lib/prisma';
import { generateImageBlurhashJob } from '../generate-image-blurhash';

export const indexerSetProfileJob = defineJob('indexer-set-profile')
  .input(
    z.object({
      address: z.string(),
      uri: z.string(),
    }),
  )
  .options({})
  .work(async (jobs) => {
    const job = jobs[0];

    // Fetch data from Arweave
    const arweaveTxId = job.data.uri.replace('ar://', '');
    const data = await fetch(`https://arweave.net/${arweaveTxId}`);
    const json = await data.json();

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
        id: job.data.address,
      },
      update: {
        ...metadataWithoutId,
      },
      create: {
        ...metadataWithoutId,
        id: job.data.address,
      },
    });

    if (profileMetadata.data.picture || profileMetadata.data.coverPicture) {
      // We do a separate update query here as for some reason prisma doesn't let us update the relationship in the upsert
      await prisma.profile.update({
        where: {
          id: job.data.address,
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
                    mimeType: 'unknown',
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
                    mimeType: 'unknown',
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

    consola.debug('indexer.set-profile', {
      id: job.data.address,
      uri: job.data.uri,
    });
  });
