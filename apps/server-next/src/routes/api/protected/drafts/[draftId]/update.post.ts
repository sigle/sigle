import { z } from 'zod';
import { readValidatedBodyZod } from '~/lib/nitro';
import { prisma } from '~/lib/prisma';

defineRouteMeta({
  openAPI: {
    tags: ['drafts'],
    description: 'Update the draft for the current profile.',
    requestBody: {
      required: true,
      content: {
        'application/json': {
          schema: {
            type: 'object',
            required: ['title', 'content'],
            properties: {
              title: {
                type: 'string',
              },
              content: {
                type: 'string',
              },
              metaTitle: {
                type: 'string',
              },
              metaDescription: {
                type: 'string',
              },
              coverImage: {
                type: 'string',
              },
            },
          },
        },
      },
    },
    responses: {
      200: {
        description: 'Draft updated.',
        content: {
          'application/json': {
            schema: {
              type: 'object',
              required: ['id'],
              properties: {
                id: {
                  type: 'string',
                },
              },
            },
          },
        },
      },
    },
  },
});

const updateDraftSchema = z.object({
  title: z.string(),
  content: z.string(),
  metaTitle: z.string().optional(),
  metaDescription: z.string().optional(),
  coverImage: z.string().optional(),
});

export default defineEventHandler(async (event) => {
  const draftId = getRouterParam(event, 'draftId');
  const body = await readValidatedBodyZod(event, updateDraftSchema);

  const updatedDraft = await prisma.draft.update({
    where: {
      id: draftId,
      userId: event.context.user.id,
    },
    data: {
      title: body.title,
      content: body.content,
      metaTitle: body.metaTitle,
      metaDescription: body.metaDescription,
      coverImage: body.coverImage,
    },
    select: {
      id: true,
    },
  });

  return updatedDraft;
});
