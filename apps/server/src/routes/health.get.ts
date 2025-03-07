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
        },
      },
    },
  },
});

export default defineEventHandler(() => {
  return { success: true };
});
