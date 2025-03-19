import { SELECT_PUBLIC_USER_FIELDS, prisma } from "~/lib/prisma";

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
      id: true,
      title: true,
      content: true,
      metaTitle: true,
      metaDescription: true,
      coverImage: true,
      excerpt: true,
      txId: true,
      address: true,
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
    collectorsCount: collectorsCount.length > 0 ? collectorsCount[0]._count : 0,
  };
});
