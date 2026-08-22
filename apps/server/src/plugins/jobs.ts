import * as Sentry from "@sentry/node";
import { definePlugin } from "nitro";
import { PgBoss } from "pg-boss";
import { env } from "@/env";
import { generateImageBlurhashJob } from "@/jobs/generate-image-blurhash";
import { indexerJob } from "@/jobs/indexer";
import { consola } from "@/lib/consola";
import { JobManager } from "@/lib/jobs";

export default definePlugin(async (nitroApp) => {
  const boss = new PgBoss(env.DATABASE_URL);

  boss.on("error", (error) => {
    consola.error("pg-boss error", error);
    Sentry.captureException(error);
  });

  const jobs = new JobManager(boss)
    .register(indexerJob)
    .register(generateImageBlurhashJob);
  await jobs.start();

  await boss.schedule("indexer", "0 * * * *", {
    action: "indexer-sync-arweave-l1-tx-ids",
    data: {},
  });

  nitroApp.hooks.hook("close", async () => {
    await boss.stop();
  });

  // await indexerJob.emit({
  //   action: "indexer-index-posts",
  //   data: {},
  // });
  // await indexerJob.emit({
  //   action: "indexer-index-profiles",
  //   data: {},
  // });
});
