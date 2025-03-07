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
            required: ["id", "createdAt", "updatedAt"],
            properties: {
              id: {
                type: "string",
                description: "The address of the user",
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

          Post: {
            type: "object",
            required: [
              "id",
              "address",
              "txId",
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
              address: {
                type: "string",
              },
              txId: {
                type: "string",
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
});

export default defineEventHandler(() => {
  return { success: true };
});
