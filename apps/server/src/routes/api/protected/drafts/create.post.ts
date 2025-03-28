import { createId } from "@paralleldrive/cuid2";
import { prisma } from "~/lib/prisma";

defineRouteMeta({
  openAPI: {
    tags: ["drafts"],
    description: "Create a new draft for the current profile.",
    responses: {
      "200": {
        description: "Draft created.",
        content: {
          "application/json": {
            schema: {
              type: "object",
              required: ["id"],
              properties: {
                id: {
                  type: "string",
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
              $ref: "#/components/schemas/BadRequest",
            },
          },
        },
      },
    },
  },
});

export default defineEventHandler(async (event) => {
  const insertedDraft = await prisma.draft.create({
    data: {
      // Move to native @default prisma cuid2 once it's supported
      // See https://github.com/prisma/prisma/issues/17102
      id: createId(),
      title: "",
      content: "",
      userId: event.context.user.id,
    },
    select: {
      id: true,
    },
  });

  event.context.$posthog.capture({
    distinctId: event.context.user.id,
    event: "draft created",
    properties: {
      postId: insertedDraft.id,
    },
  });

  return insertedDraft;
});
