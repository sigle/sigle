import { prisma } from '~/lib/prisma';

defineRouteMeta({
  openAPI: {
    tags: ['drafts'],
    description: 'Delete the draft for the current profile.',
  },
});

export default defineEventHandler(async (event) => {
  const draftId = getRouterParam(event, 'draftId');

  await prisma.draft.delete({
    where: {
      id: draftId,
      userId: event.context.user.id,
    },
  });

  event.context.$posthog.capture({
    distinctId: event.context.user.id,
    event: 'draft deleted',
    properties: {
      draftId,
    },
  });

  return true;
});
