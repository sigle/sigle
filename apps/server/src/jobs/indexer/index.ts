import { z } from "zod";
import { consola } from "~/lib/consola";
import { defineJob } from "~/lib/jobs";
import {
  executeIndexerInitMintDetailsJob,
  indexerInitMintDetailsSchema,
} from "./minter-fixed-price/init-mint-details";
import {
  executeIndexerMintJob,
  indexerMintSchema,
} from "./minter-fixed-price/mint";
import {
  executeIndexerSetMintDetailsJob,
  indexerSetMintDetailsSchema,
} from "./minter-fixed-price/set-mint-details";
import {
  executeIndexerMintEnabledJob,
  indexerMintEnabledSchema,
} from "./post/mint-enabled";
import { executeNewPostJob, indexerNewPostSchema } from "./post/new-post";
import {
  executeIndexerReduceSupplyJob,
  indexerReduceSupplySchema,
} from "./post/reduce-supply";
import {
  executeIndexerSetBaseTokenUriJob,
  indexerSetBaseTokenUriSchema,
} from "./post/set-base-token-uri";
import {
  executeIndexerSetProfileJob,
  indexerSetProfileSchema,
} from "./profile/set-profile";

export const indexerJob = defineJob("indexer")
  .input(
    z.union([
      indexerNewPostSchema,
      indexerMintEnabledSchema,
      indexerMintSchema,
      indexerSetProfileSchema,
      indexerReduceSupplySchema,
      indexerSetBaseTokenUriSchema,
      indexerInitMintDetailsSchema,
      indexerSetMintDetailsSchema,
    ]),
  )
  .options({
    priority: 100,
  })
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
      case "indexer-reduce-supply":
        await executeIndexerReduceSupplyJob(job.data.data);
        break;
      case "indexer-set-base-token-uri":
        await executeIndexerSetBaseTokenUriJob(job.data.data);
        break;
      case "indexer-set-profile":
        await executeIndexerSetProfileJob(job.data.data);
        break;
      case "indexer-init-mint-details":
        await executeIndexerInitMintDetailsJob(job.data.data);
        break;
      case "indexer-set-mint-details":
        await executeIndexerSetMintDetailsJob(job.data.data);
        break;

      default:
        consola.error("Unknown action");
        break;
    }
  });
