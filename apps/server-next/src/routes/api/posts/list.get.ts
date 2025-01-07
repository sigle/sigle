import { z } from 'zod';
import { getValidatedQueryZod } from '~/lib/nitro';
import { prisma } from '~/lib/prisma';

defineRouteMeta({
  openAPI: {
    tags: ['posts'],
    description: 'Get posts list.',
    parameters: [
      {
        in: 'query',
        name: 'limit',
        schema: {
          type: 'integer',
          minimum: 1,
          maximum: 100,
        },
        description: 'Limit the number of posts returned.',
      },
      {
        in: 'query',
        name: 'username',
        schema: {
          type: 'string',
        },
      },
    ],
    responses: {
      200: {
        description: 'Posts list.',
        content: {
          'application/json': {
            schema: {
              type: 'array',
              items: {
                type: 'object',
                required: [
                  'id',
                  'title',
                  'maxSupply',
                  'collected',
                  'openEdition',
                  'price',
                  'metadataUri',
                  'createdAt',
                  'updatedAt',
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
                  excerpt: {
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
                },
              },
            },
          },
        },
      },
    },
  },
});

const listQuerySchema = z.object({
  limit: z.coerce.number().min(1).max(100),
  username: z.string().min(1),
});

export default defineEventHandler(async (event) => {
  const query = await getValidatedQueryZod(event, listQuerySchema);

  const postsList = await prisma.post.findMany({
    select: {
      id: true,
      title: true,
      content: true,
      metaTitle: true,
      metaDescription: true,
      coverImage: true,
      excerpt: true,
      txId: true,
      maxSupply: true,
      collected: true,
      openEdition: true,
      price: true,
      metadataUri: true,
      createdAt: true,
      updatedAt: true,
    },
    where: {
      userId: query.username,
    },
    orderBy: {
      createdAt: 'desc',
    },
    take: query.limit,
  });

  return postsList;
});
