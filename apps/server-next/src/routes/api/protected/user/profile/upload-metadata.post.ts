import { ProfileMetadataSchema } from '@sigle/sdk';
import { fromError } from 'zod-validation-error';
import { aerweaveUploadFile } from '~/lib/arweave';
import { consola } from '~/lib/consola';

defineRouteMeta({
  openAPI: {
    tags: ['users'],
    description: 'Upload profile metadata to Arweave.',
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
    responses: {
      200: {
        description: 'Metadata uploaded.',
        content: {
          'application/json': {
            schema: {
              type: 'object',
              required: ['id'],
              properties: {
                id: {
                  description: 'Arweave ID.',
                  type: 'string',
                },
              },
            },
          },
        },
      },
    },
  },
});

export default defineEventHandler(async (event) => {
  consola.log('step 0');
  // TODO rate limit route 2 / minute / user
  const body = await readBody(event);

  consola.log('step 1');
  const parsedMetadata = ProfileMetadataSchema.safeParse(body.metadata);
  if (!parsedMetadata.success) {
    throw createError({
      status: 400,
      message: `Invalid metadata: ${fromError(
        parsedMetadata.error,
      ).toString()}`,
    });
  }
  consola.log('step 2');

  const { id } = await aerweaveUploadFile(event, {
    metadata: parsedMetadata.data,
  });
  consola.log('step 3');

  event.context.$posthog.capture({
    distinctId: event.context.user.id,
    event: 'profile metadata uploaded',
    properties: {
      arweaveId: id,
    },
  });

  consola.log('step 4');

  return {
    id,
  };
});
