import { definePlugin } from "nitro";
import PgBoss from "pg-boss";
import { env } from "~/env";
import { generateImageBlurhashJob } from "~/jobs/generate-image-blurhash";
import { indexerJob } from "~/jobs/indexer";
import { JobManager } from "~/lib/jobs";

export default definePlugin(async () => {
  const boss = new PgBoss(env.DATABASE_URL);
  const jobs = new JobManager(boss)
    .register(indexerJob)
    .register(generateImageBlurhashJob);
  await jobs.start();

  // await indexerJob.emit({
  //   action: "indexer-index-posts",
  //   data: {},
  // });
});
