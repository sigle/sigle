import { defineRouteMeta } from "nitro";
import { defineEventHandler } from "nitro/h3";
import { indexerJob } from "@/jobs/indexer";

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
  await indexerJob.emit({
    action: "indexer-index-profiles",
    data: {},
  });

  return { success: true };
});
