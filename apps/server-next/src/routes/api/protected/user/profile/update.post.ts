import { ProfileMetadataSchema } from '@sigle/sdk';
import { fromError } from 'zod-validation-error';
import { aerweaveUploadFile } from '~/lib/arweave';
import { prisma } from '~/lib/prisma';

defineRouteMeta({
  openAPI: {
    tags: ['users'],
    description: 'Update user profile.',
    requestBody: {
      required: true,
      content: {
        'application/json': {
          schema: {
            type: 'object',
            properties: {
              metadata: {
                type: 'object',
                description: 'Profile metadata',
              },
            },
          },
        },
      },
    },
  },
});

export default defineEventHandler(async (event) => {
  // TODO rate limit route 2 / minute / user
  const body = await readBody(event);

  const parsedMetadata = ProfileMetadataSchema.safeParse(body.metadata);
  if (!parsedMetadata.success) {
    throw createError({
      status: 400,
      message: `Invalid metadata: ${fromError(parsedMetadata.error).toString()}`,
    });
  }
  const {
    id: _,
    picture: __,
    coverPicture: ____,
    ...metadataWithoutId
  } = parsedMetadata.data;

  const { id } = await aerweaveUploadFile(event, {
    metadata: parsedMetadata.data,
  });

  event.context.$posthog.capture({
    distinctId: event.context.user.id,
    event: 'profile metadata uploaded',
    properties: {
      arweaveId: id,
    },
  });

  await prisma.profile.upsert({
    where: {
      id: event.context.user.id,
    },
    update: {
      ...metadataWithoutId,
      pictureUri: parsedMetadata.data.picture,
      coverPictureUri: parsedMetadata.data.coverPicture,
    },
    create: {
      ...metadataWithoutId,
      id: event.context.user.id,
      pictureUri: parsedMetadata.data.picture,
      coverPictureUri: parsedMetadata.data.coverPicture,
    },
  });

  return { id };
});
