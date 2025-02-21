import PgBoss from "pg-boss";
import { env } from "~/env";
import { generateImageBlurhashJob } from "~/jobs/generate-image-blurhash";
import { indexerMintJob } from "~/jobs/indexer/mint";
import { indexerMintEnabledJob } from "~/jobs/indexer/mint-enabled";
import { indexerNewPostJob } from "~/jobs/indexer/new-post";
import { indexerReduceSupplyJob } from "~/jobs/indexer/reduce-supply";
import { indexerSetProfileJob } from "~/jobs/indexer/set-profile";
import { syncMeilisearchJob } from "~/jobs/sync-meilisearch";
import { JobManager } from "~/lib/jobs";

export default defineNitroPlugin(async () => {
  const boss = new PgBoss(env.DATABASE_URL);
  const jobs = new JobManager(boss)
    .register(indexerNewPostJob)
    .register(indexerMintJob)
    .register(indexerMintEnabledJob)
    .register(indexerReduceSupplyJob)
    .register(generateImageBlurhashJob)
    .register(indexerSetProfileJob)
    .register(syncMeilisearchJob);
  await jobs.start();
});
