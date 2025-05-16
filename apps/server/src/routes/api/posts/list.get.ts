import { z } from "zod";
import { getValidatedQueryZod } from "~/lib/nitro";
import {
  SELECT_PUBLIC_POST_FIELDS,
  SELECT_PUBLIC_USER_FIELDS,
  prisma,
} from "~/lib/prisma";

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
      {
        in: "query",
        name: "offset",
        schema: {
          type: "integer",
          minimum: 0,
        },
        description:
          "The number of posts to skip before starting to collect the result set.",
      },
    ],
    responses: {
      200: {
        description: "Posts list.",
        content: {
          "application/json": {
            schema: {
              type: "object",
              properties: {
                limit: {
                  type: "integer",
                },
                offset: {
                  type: "integer",
                },
                total: {
                  type: "integer",
                },
                results: {
                  type: "array",
                  items: {
                    $ref: "#/components/schemas/Post",
                  },
                },
              },
              required: ["limit", "offset", "total", "results"],
            },
          },
        },
      },
      400: {
        description: "Bad request",
        content: {
          "application/json": {
            schema: {
              $ref: "#/components/schemas/BadRequest",
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
  offset: z.coerce.number().min(0).optional(),
});

export default defineEventHandler(async (event) => {
  const query = await getValidatedQueryZod(event, listQuerySchema);

  const where = {
    userId: query.username,
  };
  const [postsList, total] = await Promise.all([
    prisma.post.findMany({
      select: {
        ...SELECT_PUBLIC_POST_FIELDS,
        user: {
          select: SELECT_PUBLIC_USER_FIELDS,
        },
      },
      where,
      orderBy: {
        createdAt: "desc",
      },
      skip: query.offset ?? 0,
      take: query.limit,
    }),
    prisma.post.count({
      where,
    }),
  ]);

  return {
    limit: query.limit,
    offset: query.offset ?? 0,
    total,
    results: postsList,
  };
});
