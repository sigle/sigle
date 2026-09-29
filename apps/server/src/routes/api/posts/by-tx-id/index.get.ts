import { defineRouteMeta } from "nitro";
import { HTTPError, defineEventHandler, getQuery } from "nitro/h3";
import { z } from "zod";
import {
  prisma,
  SELECT_PUBLIC_POST_FIELDS,
  SELECT_PUBLIC_USER_FIELDS,
} from "@/lib/prisma";

defineRouteMeta({
  openAPI: {
    tags: ["posts"],
    description: "Get post by txId.",
    parameters: [
      {
        name: "txId",
        in: "query",
        required: true,
        schema: {
          type: "string",
        },
      },
    ],
    responses: {
      200: {
        description: "Post entry.",
        content: {
          "application/json": {
            schema: {
              $ref: "#/components/schemas/Post",
            },
          },
        },
      },
      404: {
        description: "Post not found",
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

export default defineEventHandler(async (event) => {
  const query = z
    .object({ txId: z.string().min(1) })
    .safeParse(getQuery(event));

  if (!query.success) {
    throw new HTTPError({
      status: 400,
      message: "txId query parameter is required",
    });
  }

  const { txId } = query.data;

  const post = await prisma.post.findUnique({
    select: {
      ...SELECT_PUBLIC_POST_FIELDS,
      user: {
        select: SELECT_PUBLIC_USER_FIELDS,
      },
    },
    where: {
      txId,
    },
  });

  return post;
});
