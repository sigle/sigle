import { and, asc, eq, gt, isNull, or } from "drizzle-orm";
import { Effect, Layer, Schedule } from "effect";
import { Database } from "@/db";
import { post } from "@/db/schema";
import { ArweaveService, BLOCK_HEIGHTS_MAX_IDS } from "@/services/arweave";

// Turbo bundles posts into an Arweave transaction that is usually mined
// within an hour of the upload.
const POST_ARWEAVE_BLOCK_INTERVAL = "10 minutes";

interface PendingPost {
  readonly id: string;
  readonly arweaveTxId: string;
  readonly createdAt: Date;
}

/**
 * Records the Arweave block height of the posts whose transaction the gateway
 * reports as mined. Every post without a block height is checked, page by
 * page, so posts the gateway never indexes don't hold back the others.
 */
export const recordPostArweaveBlocks = Effect.gen(function* () {
  const db = yield* Database;
  const arweave = yield* ArweaveService;

  let after: PendingPost | undefined = undefined;
  let pageSize = 0;
  let recorded = 0;

  do {
    const pending: ReadonlyArray<PendingPost> = yield* db
      .select({
        id: post.id,
        arweaveTxId: post.arweaveTxId,
        createdAt: post.createdAt,
      })
      .from(post)
      .where(
        and(
          isNull(post.arweaveBlockHeight),
          after === undefined
            ? undefined
            : or(
                gt(post.createdAt, after.createdAt),
                and(eq(post.createdAt, after.createdAt), gt(post.id, after.id)),
              ),
        ),
      )
      .orderBy(asc(post.createdAt), asc(post.id))
      .limit(BLOCK_HEIGHTS_MAX_IDS)
      .pipe(Effect.orDie);

    if (pending.length > 0) {
      const blockHeights = yield* arweave.getBlockHeights(
        pending.map((row) => row.arweaveTxId),
      );

      for (const row of pending) {
        const blockHeight = blockHeights.get(row.arweaveTxId);

        if (blockHeight !== undefined) {
          yield* db
            .update(post)
            .set({ arweaveBlockHeight: blockHeight })
            .where(eq(post.id, row.id))
            .pipe(Effect.orDie);

          recorded++;
        }
      }
    }

    pageSize = pending.length;
    after = pending.at(-1);
  } while (pageSize === BLOCK_HEIGHTS_MAX_IDS);

  if (recorded > 0) {
    yield* Effect.logInfo("Recorded post Arweave block heights", { recorded });
  }

  return { recorded };
});

export const PostArweaveBlockLive = Layer.effectDiscard(
  recordPostArweaveBlocks.pipe(
    Effect.catchCause((cause) =>
      Effect.logWarning("Recording post Arweave block heights failed", cause),
    ),
    Effect.repeat(Schedule.spaced(POST_ARWEAVE_BLOCK_INTERVAL)),
    Effect.interruptible,
    Effect.forkScoped,
  ),
);
