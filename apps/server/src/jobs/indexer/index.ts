import { z } from "zod";
import { consola } from "@/lib/consola";
import { defineJob } from "@/lib/jobs";
import {
  executeIndexerIndexPostsJob,
  indexerIndexPostsSchema,
} from "./post/index-posts";
import {
  executePublishPostJob,
  indexerPublishPostSchema,
} from "./post/publish-post";
import {
  executeIndexerSyncArweaveL1TxIdsJob,
  indexerSyncArweaveL1TxIdsSchema,
} from "./post/sync-arweave-l1-tx-ids";
import {
  executeIndexerIndexProfilesJob,
  indexerIndexProfilesSchema,
} from "./profile/index-profiles";
import {
  executeIndexerSetProfileJob,
  indexerSetProfileSchema,
} from "./profile/set-profile";

export const indexerJob = defineJob("indexer")
  .input(
    z.union([
      indexerSetProfileSchema,
      indexerIndexPostsSchema,
      indexerIndexProfilesSchema,
      indexerPublishPostSchema,
      indexerSyncArweaveL1TxIdsSchema,
    ]),
  )
  .options({
    priority: 100,
  })
  .work(async (jobs) => {
    const job = jobs[0];

    switch (job.data.action) {
      case "indexer-index-posts":
        await executeIndexerIndexPostsJob(job.data.data);
        break;
      case "indexer-publish-post":
        await executePublishPostJob(job.data.data);
        break;
      case "indexer-sync-arweave-l1-tx-ids":
        await executeIndexerSyncArweaveL1TxIdsJob(job.data.data);
        break;
      case "indexer-index-profiles":
        await executeIndexerIndexProfilesJob(job.data.data);
        break;
      case "indexer-set-profile":
        await executeIndexerSetProfileJob(job.data.data);
        break;

      default:
        consola.error("Unknown action");
        break;
    }
  });
