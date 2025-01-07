import { prisma, SELECT_PUBLIC_USER_FIELDS } from '~/lib/prisma';

defineRouteMeta({
  openAPI: {
    tags: ['users'],
    description: 'Get user profile.',
    responses: {
      200: {
        description: 'User profile.',
        content: {
          'application/json': {
            schema: {
              type: 'object',
              required: ['id', 'createdAt', 'updatedAt'],
              properties: {
                id: {
                  type: 'string',
                },
                createdAt: {
                  type: 'string',
                },
                updatedAt: {
                  type: 'string',
                },
                profile: {
                  type: 'object',
                  required: ['id'],
                  properties: {
                    id: {
                      type: 'string',
                    },
                    displayName: {
                      type: 'string',
                    },
                    description: {
                      type: 'string',
                    },
                    website: {
                      type: 'string',
                    },
                    twitter: {
                      type: 'string',
                    },
                    pictureUri: {
                      type: 'string',
                    },
                    coverPictureUri: {
                      type: 'string',
                    },
                  },
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
  const username = getRouterParam(event, 'username');
  if (!username) {
    throw createError({
      status: 400,
      statusMessage: 'Bad Request',
    });
  }

  const user = await prisma.user.findUnique({
    select: SELECT_PUBLIC_USER_FIELDS,
    where: {
      id: username,
    },
  });

  return user;
});
