import { defineRouteMeta } from "nitro";
import { defineEventHandler } from "nitro/h3";
import { indexerInputSchema, indexerWorkflow } from "@/jobs/indexer";
import { triggerWorkflow } from "@/lib/jobs";

defineRouteMeta({
  openAPI: {
    tags: ["profile"],
    description: "Trigger profile indexing.",
    responses: {
      200: {
        description: "Indexing triggered.",
        content: {
          "application/json": {
            schema: {
              type: "object",
              properties: {
                success: { type: "boolean" },
              },
            },
          },
        },
      },
    },
  },
});

export default defineEventHandler(async () => {
  await triggerWorkflow(
    indexerWorkflow,
    {
      action: "indexer-index-profiles",
      data: {},
    },
    indexerInputSchema,
  );

  return { success: true };
});
