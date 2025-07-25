import {
  prisma,
  SELECT_PUBLIC_POST_FIELDS,
  SELECT_PUBLIC_USER_FIELDS,
} from "~/lib/prisma";

defineRouteMeta({
  openAPI: {
    tags: ["posts"],
    description: "Get post.",
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

export default defineEventHandler(async (event) => {
  const postId = getRouterParam(event, "postId");
  if (!postId) {
    throw createError({
      status: 400,
      statusMessage: "Bad Request",
    });
  }

  const post = await prisma.post.findUnique({
    select: {
      ...SELECT_PUBLIC_POST_FIELDS,
      user: {
        select: SELECT_PUBLIC_USER_FIELDS,
      },
    },
    where: {
      id: postId,
    },
  });

  const collectorsCount = await prisma.postNft.groupBy({
    by: ["minterId"],
    where: {
      postId: postId,
    },
    _count: true,
  });

  return {
    ...post,
    collectorsCount: collectorsCount.length,
  };
});
