import { defineEventHandler } from "h3";
import { defineRouteMeta } from "nitropack/runtime";
import { isUserWhitelisted } from "~/lib/users";

defineRouteMeta({
  openAPI: {
    tags: ["users"],
    description: "Is user whitelisted.",
    responses: {
      200: {
        description: "Success",
        content: {
          "application/json": {
            schema: {
              type: "object",
              required: ["whitelisted"],
              properties: {
                whitelisted: { type: "boolean" },
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

export default defineEventHandler(async (event) => {
  const isWhitelisted = isUserWhitelisted(event.context.user.id);

  return {
    whitelisted: isWhitelisted,
  };
});
