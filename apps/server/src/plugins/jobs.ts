import { definePlugin } from "nitro";
import PgBoss from "pg-boss";
import { env } from "@/env";
import { generateImageBlurhashJob } from "@/jobs/generate-image-blurhash";
import { indexerJob } from "@/jobs/indexer";
import { opentimestampsStampJob } from "@/jobs/opentimestamps-stamp";
import { opentimestampsUpgradeJob } from "@/jobs/opentimestamps-upgrade";
import { JobManager } from "@/lib/jobs";

export default definePlugin(async () => {
  const boss = new PgBoss(env.DATABASE_URL);
  const jobs = new JobManager(boss)
    .register(indexerJob)
    .register(generateImageBlurhashJob)
    .register(opentimestampsStampJob)
    .register(opentimestampsUpgradeJob);
  await jobs.start();

  // await indexerJob.emit({
  //   action: "indexer-index-posts",
  //   data: {},
  // });
  // await indexerJob.emit({
  //   action: "indexer-index-profiles",
  //   data: {},
  // });
});
