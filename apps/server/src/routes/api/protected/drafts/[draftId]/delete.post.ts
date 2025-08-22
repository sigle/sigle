import { createError, defineEventHandler, getRouterParam } from "h3";
import { defineRouteMeta } from "nitropack/runtime";
import { prisma } from "~/lib/prisma";
import { isUserWhitelisted } from "~/lib/users";

defineRouteMeta({
  openAPI: {
    tags: ["drafts"],
    description: "Delete the draft for the current profile.",
  },
});

export default defineEventHandler(async (event) => {
  if (!isUserWhitelisted(event.context.user.id)) {
    throw createError({
      status: 403,
      message: "User is not whitelisted.",
    });
  }

  const draftId = getRouterParam(event, "draftId");

  await prisma.draft.delete({
    where: {
      id: draftId,
      userId: event.context.user.id,
    },
  });

  event.context.$posthog.capture({
    distinctId: event.context.user.id,
    event: "draft deleted",
    properties: {
      draftId,
    },
  });

  return true;
});
