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
    ],
    responses: {
      200: {
        description: "Posts list.",
        content: {
          "application/json": {
            schema: {
              type: "array",
              items: {
                $ref: "#/components/schemas/Post",
              },
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
});

export default defineEventHandler(async (event) => {
  const query = await getValidatedQueryZod(event, listQuerySchema);

  const postsList = await prisma.post.findMany({
    select: {
      ...SELECT_PUBLIC_POST_FIELDS,
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
