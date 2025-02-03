import { ProfileMetadataSchema } from '@sigle/sdk';
import { fromError } from 'zod-validation-error';
import { ipfsUploadFile } from '~/lib/filebase';

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
    responses: {
      200: {
        description: 'Profile metadata uploaded',
        content: {
          'application/json': {
            schema: {
              type: 'object',
              required: ['cid', 'url'],
              properties: {
                cid: { type: 'string' },
                url: { type: 'string' },
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
      message: `Invalid metadata: ${fromError(
        parsedMetadata.error,
      ).toString()}`,
    });
  }

  // TODO get blurhash from images cover and picture
  const { cid } = await ipfsUploadFile(event, {
    path: `${event.context.user.id}/profile.json`,
    content: Buffer.from(JSON.stringify(parsedMetadata.data)),
  });

  event.context.$posthog.capture({
    distinctId: event.context.user.id,
    event: 'profile metadata uploaded',
    properties: {
      cid,
    },
  });

  return {
    cid: cid.toString(),
    url: `ipfs://${cid}`,
  };
});
