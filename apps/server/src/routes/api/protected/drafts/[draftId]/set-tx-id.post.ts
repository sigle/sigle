import { z } from "zod";
import { readValidatedBodyZod } from "~/lib/nitro";
import { prisma } from "~/lib/prisma";
import { stacksApiClient } from "~/lib/stacks";

defineRouteMeta({
  openAPI: {
    tags: ["drafts"],
    description: "Update the draft for the current profile.",
    requestBody: {
      required: true,
      content: {
        "application/json": {
          schema: {
            type: "object",
            required: ["txId"],
            properties: {
              txId: {
                type: "string",
              },
            },
          },
        },
      },
    },
  },
});

const updateDraftSchema = z.object({
  txId: z.string(),
});

export default defineEventHandler(async (event) => {
  const draftId = getRouterParam(event, "draftId");
  const body = await readValidatedBodyZod(event, updateDraftSchema);

  const transaction = await stacksApiClient.GET("/extended/v1/tx/{tx_id}", {
    params: {
      path: {
        tx_id: body.txId,
      },
    },
  });

  if (!transaction.data) {
    throw new Error(`Transaction ${body.txId} not found`);
  }

  await prisma.draft.update({
    where: {
      id: draftId,
      userId: event.context.user.id,
    },
    data: {
      txId: body.txId,
      txStatus: "pending",
    },
    select: {
      id: true,
    },
  });

  event.context.$posthog.capture({
    distinctId: event.context.user.id,
    event: "draft tx id set",
    properties: {
      draftId,
      txId: body.txId,
      txStatus: "pending",
    },
  });

  return true;
});
