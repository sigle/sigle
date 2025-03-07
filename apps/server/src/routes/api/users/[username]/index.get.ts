import { SELECT_PUBLIC_USER_FIELDS, prisma } from "~/lib/prisma";

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
    select: SELECT_PUBLIC_USER_FIELDS,
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

  return user;
});
