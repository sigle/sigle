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
                  postsCount: {
                    type: 'number',
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

const NUMBER_OF_USERS = 20;

export default defineCachedEventHandler(
  async () => {
    // First get count of all users with posts
    const totalUsers = await prisma.user.count({
      where: {
        posts: {
          some: {},
        },
      },
    });

    // Calculate random offset
    const randomSkip = Math.floor(
      Math.random() * Math.max(0, totalUsers - NUMBER_OF_USERS),
    );

    const users = await prisma.user.findMany({
      select: {
        ...SELECT_PUBLIC_USER_FIELDS,
        _count: {
          select: {
            posts: {},
          },
        },
      },
      where: {
        posts: {
          some: {},
        },
      },
      skip: randomSkip,
      take: NUMBER_OF_USERS,
    });

    return users.map((user) => ({
      ...user,
      postsCount: user._count.posts,
      _count: undefined,
    }));
  },
  {
    maxAge: 60 * 5, // 5 minutes
  },
);
