import { eq, sql } from "drizzle-orm";
import { Effect, Layer, Schedule, Schema } from "effect";
import { Database } from "@/db";
import { profile } from "@/db/schema";
import { indexProfileJob, indexProfileJobId } from "@/jobs/index-profile";
import { defineJob } from "@/queue/core";
import {
  ARWEAVE_GRAPHQL_PAGE_SIZE,
  ArweaveGraphQLService,
  type ArweaveTransactionEdge,
} from "@/services/arweave-graphql";

export const INDEX_PROFILES_QUEUE_NAME = "index-profiles";

export const INDEX_PROFILES_MAX_ATTEMPTS = 3;

export const INDEX_PROFILES_SCAN_INTERVAL = "10 minutes";

const INDEX_PROFILES_SCAN_INTERVAL_MILLIS = 10 * 60 * 1000;

export const IndexProfilesJobSchema = Schema.Struct({});

export type IndexProfilesJob = typeof IndexProfilesJobSchema.Type;

/**
 * Stable id per scan bucket, so replicas scheduling the same interval window
 * collapse into a single queue element.
 */
export const indexProfilesScanJobId = (now: number): string =>
  `index-profiles:${Math.floor(now / INDEX_PROFILES_SCAN_INTERVAL_MILLIS)}`;

/**
 * Profiles stored on upload have no block height yet; they are offered once so
 * discovery can fill it in. Profiles already indexed from Arweave are skipped.
 */
const findNewProfileTransaction = (
  edge: ArweaveTransactionEdge,
): Effect.Effect<boolean, never, Database> =>
  Effect.gen(function* () {
    const db = yield* Database;

    const [known] = yield* db
      .select({ arweaveBlockHeight: profile.arweaveBlockHeight })
      .from(profile)
      .where(eq(profile.arweaveTxId, edge.node.id))
      .limit(1);

    return known === undefined || known.arweaveBlockHeight === null;
  }).pipe(Effect.orDie);

/**
 * Scans Arweave for profile metadata transactions since the latest indexed
 * block and offers one `index-profile` job per new transaction. Already
 * indexed transactions are filtered by their transaction id before offering.
 */
export const processIndexProfilesJob = Effect.gen(function* () {
  const graphql = yield* ArweaveGraphQLService;
  const db = yield* Database;

  const [latest] = yield* db
    .select({
      maxBlockHeight: sql<number | null>`max(${profile.arweaveBlockHeight})`,
    })
    .from(profile)
    .pipe(Effect.orDie);

  const minBlockHeight = latest?.maxBlockHeight ?? 0;

  let afterCursor: string | undefined = undefined;
  let indexed = 0;

  while (true) {
    const edges: ReadonlyArray<ArweaveTransactionEdge> =
      yield* graphql.fetchProfileTransactions({
        minBlockHeight,
        afterCursor,
      });

    if (edges.length === 0) {
      break;
    }

    afterCursor = edges.at(-1)?.cursor;

    for (const edge of edges) {
      const isNew = yield* findNewProfileTransaction(edge);

      if (isNew) {
        const txId = edge.node.id;
        const blockHeight: number = edge.node.block?.height ?? 0;

        const blockTimestamp: number =
          edge.node.block?.timestamp ?? Math.floor(Date.now() / 1000);

        yield* indexProfileJob
          .offer(
            { txId, blockHeight, blockTimestamp, uri: `ar://${txId}` },
            { id: indexProfileJobId(txId) },
          )
          .pipe(Effect.orDie);

        indexed += 1;
      }
    }

    if (edges.length < ARWEAVE_GRAPHQL_PAGE_SIZE) {
      break;
    }
  }

  yield* Effect.logInfo("index-profiles scan complete", {
    indexed,
    minBlockHeight,
  });
});

export const indexProfilesJob = defineJob({
  name: INDEX_PROFILES_QUEUE_NAME,
  payload: IndexProfilesJobSchema,
  maxAttempts: INDEX_PROFILES_MAX_ATTEMPTS,
  concurrency: 1,
  process: () => processIndexProfilesJob,
  reportPayload: () => ({}),
});

export const IndexProfilesWorkerLive = indexProfilesJob
  .workerLayer()
  .pipe(
    Layer.provideMerge(indexProfilesJob.layer),
    Layer.provideMerge(indexProfileJob.layer),
  );

const scheduleIndexProfilesScan = Effect.flatMap(
  Effect.sync(() => indexProfilesScanJobId(Date.now())),
  (id) => indexProfilesJob.offer({}, { id }),
).pipe(Effect.orDie);

/**
 * Schedules a profiles scan every interval. The offer id is stable per
 * interval bucket, so overlapping replicas do not enqueue duplicate scans.
 */
export const IndexProfilesScanLive = Layer.effectDiscard(
  scheduleIndexProfilesScan.pipe(
    Effect.catchCause((cause) =>
      Effect.logWarning("Index profiles scan scheduling failed", cause),
    ),
    Effect.repeat(Schedule.spaced(INDEX_PROFILES_SCAN_INTERVAL)),
    Effect.interruptible,
    Effect.forkScoped,
  ),
).pipe(Layer.provideMerge(indexProfilesJob.layer));
