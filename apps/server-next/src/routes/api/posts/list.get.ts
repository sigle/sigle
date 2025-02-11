import { z } from "zod";
import { getValidatedQueryZod } from "~/lib/nitro";
import { SELECT_PUBLIC_USER_FIELDS, prisma } from "~/lib/prisma";

defineRouteMeta({
  openAPI: {
    tags: ["posts"],
    description: "Get posts list.",
    parameters: [
      {
        in: "query",
        name: "limit",
        schema: {
          type: "integer",
          minimum: 1,
          maximum: 100,
        },
        description: "Limit the number of posts returned.",
      },
      {
        in: "query",
        name: "username",
        schema: {
          type: "string",
        },
        description: "The address of the user to get posts for.",
      },
    ],
    responses: {
      200: {
        description: "Posts list.",
        content: {
          "application/json": {
            schema: {
              type: "array",
              items: {
                type: "object",
                required: [
                  "id",
                  "address",
                  "title",
                  "maxSupply",
                  "collected",
                  "openEdition",
                  "price",
                  "metadataUri",
                  "createdAt",
                  "updatedAt",
                  "user",
                ],
                properties: {
                  id: {
                    type: "string",
                  },
                  address: {
                    type: "string",
                  },
                  title: {
                    type: "string",
                  },
                  content: {
                    type: "string",
                  },
                  metaTitle: {
                    type: "string",
                  },
                  metaDescription: {
                    type: "string",
                  },
                  excerpt: {
                    type: "string",
                  },
                  coverImage: {
                    type: "object",
                    required: ["id"],
                    properties: {
                      id: {
                        type: "string",
                      },
                      width: {
                        type: "number",
                      },
                      height: {
                        type: "number",
                      },
                      blurhash: {
                        type: "string",
                      },
                    },
                  },
                  maxSupply: {
                    type: "number",
                  },
                  collected: {
                    type: "number",
                  },
                  openEdition: {
                    type: "boolean",
                  },
                  price: {
                    type: "string",
                  },
                  metadataUri: {
                    type: "string",
                  },
                  createdAt: {
                    type: "string",
                  },
                  updatedAt: {
                    type: "string",
                  },
                  user: {
                    type: "object",
                    required: ["id", "createdAt", "updatedAt"],
                    properties: {
                      id: {
                        type: "string",
                      },
                      createdAt: {
                        type: "string",
                      },
                      updatedAt: {
                        type: "string",
                      },
                      profile: {
                        type: "object",
                        required: ["id"],
                        properties: {
                          id: {
                            type: "string",
                          },
                          displayName: {
                            type: "string",
                          },
                          description: {
                            type: "string",
                          },
                          website: {
                            type: "string",
                          },
                          twitter: {
                            type: "string",
                          },
                          pictureUri: {
                            type: "object",
                            required: ["id"],
                            properties: {
                              id: {
                                type: "string",
                              },
                              width: {
                                type: "number",
                              },
                              height: {
                                type: "number",
                              },
                              blurhash: {
                                type: "string",
                              },
                            },
                          },
                          coverPictureUri: {
                            type: "object",
                            required: ["id"],
                            properties: {
                              id: {
                                type: "string",
                              },
                              width: {
                                type: "number",
                              },
                              height: {
                                type: "number",
                              },
                              blurhash: {
                                type: "string",
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
    },
  },
});

const listQuerySchema = z.object({
  limit: z.coerce.number().min(1).max(100),
  username: z.string().min(1).optional(),
});

export default defineEventHandler(async (event) => {
  const query = await getValidatedQueryZod(event, listQuerySchema);

  const postsList = await prisma.post.findMany({
    select: {
      id: true,
      address: true,
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
      user: {
        select: SELECT_PUBLIC_USER_FIELDS,
      },
    },
    where: {
      userId: query.username,
    },
    orderBy: {
      createdAt: "desc",
    },
    take: query.limit,
  });

  return postsList;
});
