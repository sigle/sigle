import { z } from "zod";
import { consola } from "~/lib/consola";
import { defineJob } from "~/lib/jobs";
import { executeIndexerMintJob, indexerMintSchema } from "./mint";
import {
  executeIndexerMintEnabledJob,
  indexerMintEnabledSchema,
} from "./mint-enabled";
import { executeNewPostJob, indexerNewPostSchema } from "./new-post";

export const indexerJob = defineJob("indexer")
  .input(
    z.union([
      indexerNewPostSchema,
      indexerMintEnabledSchema,
      indexerMintSchema,
    ]),
  )
  .options({})
  .work(async (jobs) => {
    const job = jobs[0];

    switch (job.data.action) {
      case "indexer-new-post":
        await executeNewPostJob(job.data.data);
        break;
      case "indexer-mint-enabled":
        await executeIndexerMintEnabledJob(job.data.data);
        break;
      case "indexer-mint":
        await executeIndexerMintJob(job.data.data);
        break;
      default:
        consola.error("Unknown action");
        break;
    }
  });
