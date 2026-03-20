import { defineRouteMeta } from "nitro";
import { defineEventHandler } from "nitro/h3";

defineRouteMeta({
  openAPI: {
    summary: "Health check",
    description: "Check the health of the server",
    tags: ["Internal"],
    operationId: "healthCheck",
    responses: {
      "200": {
        description: "OK",
        content: {
          "application/json": {
            schema: {
              type: "object",
              properties: {
                success: {
                  type: "boolean",
                  description: "Whether the server is healthy",
                },
              },
            },
          },
        },
      },
    },
    $global: {
      components: {
        schemas: {
          BadRequest: {
            type: "object",
            required: ["message"],
            properties: {
              message: {
                type: "string",
              },
            },
          },

          UserProfile: {
            type: "object",
            required: ["id", "flag", "createdAt", "updatedAt"],
            properties: {
              id: {
                type: "string",
                description: "The address of the user",
              },
              flag: {
                type: "string",
                enum: ["NONE", "VERIFIED"],
                description: "The flag of the user",
              },
              postsCount: {
                type: "number",
              },
              createdAt: {
                type: "string",
              },
              updatedAt: {
                type: "string",
              },
              profile: {
                type: "object",
                required: ["id", "txId"],
                properties: {
                  id: {
                    type: "string",
                  },
                  txId: {
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

          Post: {
            type: "object",
            required: [
              "id",
              "txId",
              "blockHeight",
              "title",
              "metadataUri",
              "createdAt",
              "updatedAt",
              "user",
            ],
            properties: {
              id: {
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
              excerpt: {
                type: "string",
              },
              tags: {
                type: "array",
                items: {
                  type: "string",
                },
              },
              canonicalUri: {
                type: "string",
              },
              txId: {
                type: "string",
              },
              blockHeight: {
                type: "number",
              },
              collectorsCount: {
                type: "number",
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
              minterFixedPrice: {
                type: "object",
                required: ["id", "price", "startBlock", "endBlock"],
                properties: {
                  id: {
                    type: "string",
                  },
                  price: {
                    type: "string",
                    description: "The price in BigInt format",
                  },
                  startBlock: {
                    type: "string",
                    description: "The start block in BigInt format",
                  },
                  endBlock: {
                    type: "string",
                    description: "The end block in BigInt format",
                  },
                },
              },
              collectible: {
                type: "object",
                required: [
                  "id",
                  "address",
                  "maxSupply",
                  "openEdition",
                  "collected",
                  "enabled",
                ],
                properties: {
                  id: {
                    type: "string",
                  },
                  address: {
                    type: "string",
                  },
                  maxSupply: {
                    type: "number",
                  },
                  openEdition: {
                    type: "boolean",
                  },
                  collected: {
                    type: "number",
                  },
                  enabled: {
                    type: "boolean",
                  },
                },
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
                    required: ["id", "txId"],
                    properties: {
                      id: {
                        type: "string",
                      },
                      txId: {
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
});

export default defineEventHandler(() => {
  return { success: true };
});
