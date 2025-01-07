import { prisma, SELECT_PUBLIC_USER_FIELDS } from '~/lib/prisma';

defineRouteMeta({
  openAPI: {
    tags: ['posts'],
    description: 'Get post.',
    responses: {
      200: {
        description: 'Post entry.',
        content: {
          'application/json': {
            schema: {
              type: 'object',
              required: [
                'id',
                'address',
                'txId',
                'title',
                'maxSupply',
                'collected',
                'openEdition',
                'price',
                'metadataUri',
                'createdAt',
                'updatedAt',
                'user',
              ],
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
                excerpt: {
                  type: 'string',
                },
                address: {
                  type: 'string',
                },
                txId: {
                  type: 'string',
                },
                maxSupply: {
                  type: 'number',
                },
                collected: {
                  type: 'number',
                },
                openEdition: {
                  type: 'boolean',
                },
                price: {
                  type: 'string',
                },
                metadataUri: {
                  type: 'string',
                },
                createdAt: {
                  type: 'string',
                },
                updatedAt: {
                  type: 'string',
                },
                user: {
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
    },
  },
});

export default defineEventHandler(async (event) => {
  const postId = getRouterParam(event, 'postId');
  if (!postId) {
    throw createError({
      status: 400,
      statusMessage: 'Bad Request',
    });
  }

  const post = await prisma.post.findUnique({
    select: {
      id: true,
      title: true,
      content: true,
      metaTitle: true,
      metaDescription: true,
      coverImage: true,
      excerpt: true,
      txId: true,
      address: true,
      maxSupply: true,
      collected: true,
      openEdition: true,
      price: true,
      metadataUri: true,
      createdAt: true,
      updatedAt: true,
      user: {
        select: SELECT_PUBLIC_USER_FIELDS,
      },
    },
    where: {
      id: postId,
    },
  });

  // const uniqueMinters = await prisma.postNft.groupBy({
  //   by: ['minterId'],
  //   where: {
  //     postId: postId,
  //   },
  //   _count: true,
  // });

  return post;
});
