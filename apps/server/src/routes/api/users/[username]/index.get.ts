import { prisma, SELECT_PUBLIC_USER_FIELDS } from "~/lib/prisma";

defineRouteMeta({
  openAPI: {
    tags: ["users"],
    description: "Get user profile.",
    responses: {
      200: {
        description: "User profile.",
        content: {
          "application/json": {
            schema: { $ref: "#/components/schemas/UserProfile" },
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
  const username = getRouterParam(event, "username");
  if (!username) {
    throw createError({
      status: 400,
      statusMessage: "Bad Request",
    });
  }

  const user = await prisma.user.findUnique({
    select: {
      ...SELECT_PUBLIC_USER_FIELDS,
      _count: {
        select: {
          posts: {},
        },
      },
    },
    where: {
      id: username,
    },
  });

  if (!user) {
    throw createError({
      status: 404,
      statusMessage: "User not found",
    });
  }

  return {
    ...user,
    postsCount: user._count.posts,
    _count: undefined,
  };
});
