import { z } from "zod";
import { consola } from "@/lib/consola";
import { defineWorkflow, withStepSentry } from "@/lib/jobs";
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
  executeIndexerIndexPostsJob,
  indexerIndexPostsSchema,
} from "./post/index-posts";
import {
  executeIndexerMintEnabledJob,
  indexerMintEnabledSchema,
} from "./post/mint-enabled";
import { executeNewPostJob, indexerNewPostSchema } from "./post/new-post";
import {
  executePublishPostJob,
  indexerPublishPostSchema,
} from "./post/publish-post";
import {
  executeIndexerReduceSupplyJob,
  indexerReduceSupplySchema,
} from "./post/reduce-supply";
import {
  executeIndexerSetBaseTokenUriJob,
  indexerSetBaseTokenUriSchema,
} from "./post/set-base-token-uri";
import {
  executeIndexerIndexProfilesJob,
  indexerIndexProfilesSchema,
} from "./profile/index-profiles";
import {
  executeIndexerSetProfileJob,
  indexerSetProfileSchema,
} from "./profile/set-profile";

export const indexerInputSchema = z.union([
  indexerNewPostSchema,
  indexerMintEnabledSchema,
  indexerMintSchema,
  indexerReduceSupplySchema,
  indexerSetBaseTokenUriSchema,
  indexerInitMintDetailsSchema,
  indexerSetMintDetailsSchema,

  indexerSetProfileSchema,
  indexerIndexPostsSchema,
  indexerIndexProfilesSchema,
  indexerPublishPostSchema,
]);

export async function processIndexerStep(
  jobData: z.infer<typeof indexerInputSchema>,
) {
  "use step";
  return withStepSentry("processIndexerStep", async () => {
    switch (jobData.action) {
      case "indexer-new-post":
        await executeNewPostJob(jobData.data);
        break;
      case "indexer-mint-enabled":
        await executeIndexerMintEnabledJob(jobData.data);
        break;
      case "indexer-mint":
        await executeIndexerMintJob(jobData.data);
        break;
      case "indexer-reduce-supply":
        await executeIndexerReduceSupplyJob(jobData.data);
        break;
      case "indexer-set-base-token-uri":
        await executeIndexerSetBaseTokenUriJob(jobData.data);
        break;
      case "indexer-init-mint-details":
        await executeIndexerInitMintDetailsJob(jobData.data);
        break;
      case "indexer-set-mint-details":
        await executeIndexerSetMintDetailsJob(jobData.data);
        break;

      case "indexer-index-posts":
        await executeIndexerIndexPostsJob(jobData.data);
        break;
      case "indexer-publish-post":
        await executePublishPostJob(jobData.data);
        break;
      case "indexer-index-profiles":
        await executeIndexerIndexProfilesJob(jobData.data);
        break;
      case "indexer-set-profile":
        await executeIndexerSetProfileJob(jobData.data);
        break;

      default:
        consola.error("Unknown action");
        break;
    }
  });
}

export const indexerWorkflow = defineWorkflow(
  indexerInputSchema,
  async (jobData: z.infer<typeof indexerInputSchema>) => {
    "use workflow";
    await processIndexerStep(jobData);
  },
);
