import { z } from "zod";
import { getValidatedQueryZod } from "~/lib/nitro";
import { prisma } from "~/lib/prisma";

defineRouteMeta({
  openAPI: {
    tags: ["drafts"],
    description: "Get drafts for the current profile.",
    parameters: [
      {
        in: "query",
        name: "limit",
        schema: {
          type: "integer",
          minimum: 1,
          maximum: 100,
        },
        description: "Limit the number of drafts returned.",
      },
    ],
    responses: {
      200: {
        description: "Drafts list.",
        content: {
          "application/json": {
            schema: {
              type: "array",
              items: {
                type: "object",
                required: ["id", "title", "createdAt", "updatedAt"],
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
                    type: "string",
                  },
                  txId: {
                    type: "string",
                  },
                  txStatus: {
                    type: "string",
                  },
                  createdAt: {
                    type: "string",
                  },
                  updatedAt: {
                    type: "string",
                  },
                },
              },
            },
          },
        },
      },
      "400": {
        description: "Bad request",
        content: {
          "application/json": {
            schema: {
              type: "object",
              required: ["message"],
              properties: {
                message: {
                  type: "string",
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
});

export default defineEventHandler(async (event) => {
  const query = await getValidatedQueryZod(event, listQuerySchema);

  const draftsList = await prisma.draft.findMany({
    select: {
      id: true,
      title: true,
      content: true,
      metaTitle: true,
      metaDescription: true,
      coverImage: true,
      txId: true,
      txStatus: true,
      createdAt: true,
      updatedAt: true,
    },
    where: {
      userId: event.context.user.id,
    },
    orderBy: {
      updatedAt: "desc",
    },
    take: query.limit,
  });

  return draftsList;
});
