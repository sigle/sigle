import { prisma } from '~/lib/prisma';

defineRouteMeta({
  openAPI: {
    tags: ['drafts'],
    description: 'Get draft for the current profile.',
    responses: {
      200: {
        description: 'Draft entry.',
        content: {
          'application/json': {
            schema: {
              type: 'object',
              required: ['id', 'title', 'createdAt', 'updatedAt'],
              properties: {
                id: {
                  type: 'string',
                },
                title: {
                  type: 'string',
                },
                content: {
                  type: 'string',
                },
                metaTitle: {
                  type: 'string',
                },
                metaDescription: {
                  type: 'string',
                },
                coverImage: {
                  type: 'string',
                },
                txId: {
                  type: 'string',
                },
                txStatus: {
                  type: 'string',
                },
                createdAt: {
                  type: 'string',
                },
                updatedAt: {
                  type: 'string',
                },
              },
            },
          },
        },
      },
      404: {
        description: 'Draft not found.',
        content: {
          'application/json': {
            schema: {
              type: 'object',
              properties: {
                message: {
                  type: 'string',
                  example: 'Draft not found.',
                },
                statusCode: {
                  type: 'number',
                  example: 404,
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
  const draftId = getRouterParam(event, 'draftId');

  if (!draftId) {
    throw createError({
      status: 400,
      statusMessage: 'Bad Request',
    });
  }

  const draft = await prisma.draft.findUnique({
    select: {
      id: true,
      title: true,
      content: true,
      metaTitle: true,
      metaDescription: true,
      coverImage: true,
      txId: true,
      txStatus: true,
      createdAt: true,
      updatedAt: true,
    },
    where: {
      id: draftId,
      userId: event.context.user.id,
    },
  });

  if (!draft) {
    throw createError({
      status: 404,
      statusMessage: 'Not Found',
    });
  }

  return draft;
});
