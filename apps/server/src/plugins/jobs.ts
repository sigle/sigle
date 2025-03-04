import PgBoss from "pg-boss";
import { env } from "~/env";
import { generateImageBlurhashJob } from "~/jobs/generate-image-blurhash";
import { indexerJob } from "~/jobs/indexer";
import { indexerReduceSupplyJob } from "~/jobs/indexer/reduce-supply";
import { indexerSetProfileJob } from "~/jobs/indexer/set-profile";
import { JobManager } from "~/lib/jobs";

export default defineNitroPlugin(async () => {
  const boss = new PgBoss(env.DATABASE_URL);
  const jobs = new JobManager(boss)
    .register(indexerJob)
    .register(indexerReduceSupplyJob)
    .register(indexerSetProfileJob)
    .register(generateImageBlurhashJob);
  await jobs.start();
});
