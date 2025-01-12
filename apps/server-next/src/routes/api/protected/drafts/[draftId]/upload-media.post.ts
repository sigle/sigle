import { createId } from '@paralleldrive/cuid2';
import { z } from 'zod';
import { env } from '~/env';
import { generateCID } from '~/lib/arweave';
import { ipfsUploadFile } from '~/lib/filebase';
import {
  allowedFormats,
  mimeTypeToExtension,
  optimizeImage,
} from '~/lib/images';
import { readMultipartFormDataSafe } from '~/lib/nitro';
import { prisma } from '~/lib/prisma';

defineRouteMeta({
  openAPI: {
    tags: ['drafts'],
    description: 'Upload draft media.',
    requestBody: {
      required: true,
      content: {
        'multipart/form-data': {
          schema: {
            type: 'object',
            properties: {
              file: {
                type: 'string',
                format: 'binary',
                description: 'Profile media',
              },
            },
            required: ['file'],
          },
        },
      },
    },
    responses: {
      200: {
        description: 'Media uploaded',
        content: {
          'application/json': {
            schema: {
              type: 'object',
              required: ['cid', 'url', 'gatewayUrl'],
              properties: {
                cid: { type: 'string' },
                url: { type: 'string' },
                gatewayUrl: { type: 'string' },
              },
            },
          },
        },
      },
    },
  },
});

const fileSchema = z.object({
  name: z.string(),
  filename: z.string(),
  type: z.enum(allowedFormats),
});

export default defineEventHandler(async (event) => {
  // TODO rate limit route 10 / minute / user
  const draftId = getRouterParam(event, 'draftId');
  const formData = await readMultipartFormDataSafe(event, '5mb');

  const file = formData?.find((f) => f.name === 'file');
  if (!file) {
    throw createError({
      status: 400,
      message: 'No file provided',
    });
  }

  const parsedFile = fileSchema.safeParse(file);
  if (!parsedFile.success) {
    throw createError({
      status: 400,
      message: 'Invalid file',
    });
  }

  const draft = await prisma.draft.findUnique({
    select: {
      id: true,
    },
    where: {
      id: draftId,
      userId: event.context.user.id,
    },
  });
  if (!draft) {
    throw createError({
      status: 404,
      message: 'Draft not found.',
    });
  }

  const optimizedBuffer = await optimizeImage({
    buffer: file.data,
    contentType: parsedFile.data.type,
    quality: 75,
    width: 700,
  });

  const generatedCID = await generateCID(optimizedBuffer);
  const { cid } = await ipfsUploadFile(event, {
    path: `${
      event.context.user.id
    }/post-${draftId}/${generatedCID}.${mimeTypeToExtension(
      parsedFile.data.type,
    )}`,
    content: optimizedBuffer,
  });

  event.context.$posthog.capture({
    distinctId: event.context.user.id,
    event: 'draft media uploaded',
    properties: {
      draftId,
      cid,
    },
  });

  return {
    cid,
    url: `ipfs://${cid}`,
    gatewayUrl: `${env.IPFS_GATEWAY_URL}/ipfs/${cid}`,
  };
});
