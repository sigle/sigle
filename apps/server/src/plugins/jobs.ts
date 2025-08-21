import { defineNitroPlugin } from "nitropack/runtime";
import PgBoss from "pg-boss";
import { env } from "~/env";
import { generateImageBlurhashJob } from "~/jobs/generate-image-blurhash";
import { indexerJob } from "~/jobs/indexer";
import { JobManager } from "~/lib/jobs";

export default defineNitroPlugin(async () => {
  const boss = new PgBoss(env.DATABASE_URL);
  const jobs = new JobManager(boss)
    .register(indexerJob)
    .register(generateImageBlurhashJob);
  await jobs.start();
});
