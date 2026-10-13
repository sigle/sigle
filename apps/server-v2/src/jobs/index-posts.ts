import { ArweaveTags, ArweaveTransactionTypes } from "@sigle/sdk";
import { eq, sql } from "drizzle-orm";
import { Effect, Layer, Option, Schedule, Schema } from "effect";
import { Database } from "@/db";
import { post, postRevision } from "@/db/schema";
import { indexPostJob, indexPostJobId } from "@/jobs/index-post";
import { defineJob } from "@/queue/core";
import {
  ARWEAVE_GRAPHQL_PAGE_SIZE,
  ArweaveGraphQLService,
  type ArweaveTransactionEdge,
} from "@/services/arweave-graphql";

export const INDEX_POSTS_QUEUE_NAME = "index-posts";

export const INDEX_POSTS_MAX_ATTEMPTS = 3;

export const INDEX_POSTS_SCAN_INTERVAL = "10 minutes";

const INDEX_POSTS_SCAN_INTERVAL_MILLIS = 10 * 60 * 1000;

/**
 * The v1 arweave tag pointing at the root transaction of an edited post.
 * Shared with the writer side; the SDK only models the app-name and profile
 * tags used for uploads.
 */
const ROOT_TX_TAG = "Root-TX";

export const IndexPostsJobSchema = Schema.Struct({});

export type IndexPostsJob = typeof IndexPostsJobSchema.Type;

interface NewTransaction {
  readonly rootTxId: string | undefined;
}

/**
 * Stable id per scan bucket, so replicas scheduling the same interval window
 * collapse into a single queue element.
 */
export const indexPostsScanJobId = (now: number): string =>
  `index-posts:${Math.floor(now / INDEX_POSTS_SCAN_INTERVAL_MILLIS)}`;

/**
 * Returns `Some` when the transaction is a post not indexed yet: not a profile
 * transaction, not the latest transaction of a post and not a revision.
 */
const findNewTransaction = (
  edge: ArweaveTransactionEdge,
): Effect.Effect<Option.Option<NewTransaction>, never, Database> =>
  Effect.gen(function* () {
    const db = yield* Database;
    const tags = edge.node.tags ?? [];

    const isProfileTransaction = tags.some(
      (tag) =>
        tag.name === ArweaveTags.type &&
        tag.value === ArweaveTransactionTypes.profile,
    );

    if (isProfileTransaction) {
      return Option.none<NewTransaction>();
    }

    const [knownPost] = yield* db
      .select({ id: post.id })
      .from(post)
      .where(eq(post.arweaveTxId, edge.node.id))
      .limit(1);

    if (knownPost !== undefined) {
      return Option.none<NewTransaction>();
    }

    const [knownRevision] = yield* db
      .select({ id: postRevision.id })
      .from(postRevision)
      .where(eq(postRevision.txId, edge.node.id))
      .limit(1);

    if (knownRevision !== undefined) {
      return Option.none<NewTransaction>();
    }

    return Option.some<NewTransaction>({
      rootTxId: tags.find((tag) => tag.name === ROOT_TX_TAG)?.value,
    });
  }).pipe(Effect.orDie);

/**
 * Scans Arweave for post metadata transactions since the latest indexed block
 * and offers one `index-post` job per new transaction. Profile transactions
 * share the app-name tag and are skipped. Runs are idempotent: already indexed
 * transactions are filtered by their post or revision row before offering.
 */
export const processIndexPostsJob = Effect.gen(function* () {
  const graphql = yield* ArweaveGraphQLService;
  const db = yield* Database;

  const [latest] = yield* db
    .select({
      maxBlockHeight: sql<number | null>`max(${post.arweaveBlockHeight})`,
    })
    .from(post)
    .pipe(Effect.orDie);

  const minBlockHeight = latest?.maxBlockHeight ?? 0;

  let afterCursor: string | undefined = undefined;
  let indexed = 0;

  while (true) {
    const edges: ReadonlyArray<ArweaveTransactionEdge> =
      yield* graphql.fetchPostTransactions({
        minBlockHeight,
        afterCursor,
      });

    if (edges.length === 0) {
      break;
    }

    afterCursor = edges.at(-1)?.cursor;

    for (const edge of edges) {
      const candidate = yield* findNewTransaction(edge);

      if (Option.isSome(candidate)) {
        const rootTxId = candidate.value.rootTxId;
        const blockHeight: number = edge.node.block?.height ?? 0;

        const blockTimestamp: number =
          edge.node.block?.timestamp ?? Math.floor(Date.now() / 1000);

        const uri = `ar://${edge.node.id}`;
        const txId = edge.node.id;

        const payload =
          rootTxId === undefined
            ? { txId, blockHeight, blockTimestamp, uri }
            : { txId, rootTxId, blockHeight, blockTimestamp, uri };

        yield* indexPostJob
          .offer(payload, { id: indexPostJobId(txId) })
          .pipe(Effect.orDie);

        indexed += 1;
      }
    }

    if (edges.length < ARWEAVE_GRAPHQL_PAGE_SIZE) {
      break;
    }
  }

  yield* Effect.logInfo("index-posts scan complete", {
    indexed,
    minBlockHeight,
  });
});

export const indexPostsJob = defineJob({
  name: INDEX_POSTS_QUEUE_NAME,
  payload: IndexPostsJobSchema,
  maxAttempts: INDEX_POSTS_MAX_ATTEMPTS,
  concurrency: 1,
  process: () => processIndexPostsJob,
  reportPayload: () => ({}),
});

export const IndexPostsWorkerLive = indexPostsJob
  .workerLayer()
  .pipe(
    Layer.provideMerge(indexPostsJob.layer),
    Layer.provideMerge(indexPostJob.layer),
  );

const scheduleIndexPostsScan = Effect.flatMap(
  Effect.sync(() => indexPostsScanJobId(Date.now())),
  (id) => indexPostsJob.offer({}, { id }),
).pipe(Effect.orDie);

/**
 * Schedules a posts scan every interval. The offer id is stable per interval
 * bucket, so overlapping replicas do not enqueue duplicate scans.
 */
export const IndexPostsScanLive = Layer.effectDiscard(
  scheduleIndexPostsScan.pipe(
    Effect.catchCause((cause) =>
      Effect.logWarning("Index posts scan scheduling failed", cause),
    ),
    Effect.repeat(Schedule.spaced(INDEX_POSTS_SCAN_INTERVAL)),
    Effect.interruptible,
    Effect.forkScoped,
  ),
).pipe(Layer.provideMerge(indexPostsJob.layer));
