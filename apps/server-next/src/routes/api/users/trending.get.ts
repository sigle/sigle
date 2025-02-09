import { prisma, SELECT_PUBLIC_USER_FIELDS } from '~/lib/prisma';

defineRouteMeta({
  openAPI: {
    tags: ['users'],
    description: 'Get trending profiles.',
    responses: {
      200: {
        description: 'User profiles.',
        content: {
          'application/json': {
            schema: {
              type: 'array',
              items: {
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
                        type: 'object',
                        required: ['id'],
                        properties: {
                          id: {
                            type: 'string',
                          },
                          width: {
                            type: 'number',
                          },
                          height: {
                            type: 'number',
                          },
                          blurhash: {
                            type: 'string',
                          },
                        },
                      },
                      coverPictureUri: {
                        type: 'object',
                        required: ['id'],
                        properties: {
                          id: {
                            type: 'string',
                          },
                          width: {
                            type: 'number',
                          },
                          height: {
                            type: 'number',
                          },
                          blurhash: {
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
      },
    },
  },
});

export default defineEventHandler(async () => {
  const users = await prisma.user.findMany({
    select: SELECT_PUBLIC_USER_FIELDS,
    orderBy: {
      createdAt: 'desc',
    },
    take: 10,
  });

  return users;
});
