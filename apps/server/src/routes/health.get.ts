defineRouteMeta({
  openAPI: {
    summary: "Health check",
    description: "Check the health of the server",
    tags: ["Health"],
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
  },
});

export default defineEventHandler(() => {
  return { success: true };
});
