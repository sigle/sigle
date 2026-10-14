import { ArweaveTags, ArweaveTransactionTypes } from "@sigle/sdk";
import { and, inArray, isNotNull, max } from "drizzle-orm";
import { Effect, Layer, Schedule } from "effect";
import { AppConfig } from "@/config";
import { Database } from "@/db";
import { profile } from "@/db/schema";
import {
  ArweaveService,
  type ArweaveTransactionsPage,
} from "@/services/arweave";
import { indexProfileJob, indexProfileJobId } from "./index-profile";

/**
 * Blocks re-scanned below the highest indexed profile. Gateways unbundle data
 * items asynchronously, so a transaction can become visible after another one
 * mined in a later block.
 */
export const PROFILE_INDEX_RESCAN_BLOCKS = 50;

const PROFILE_INDEX_INTERVAL = "1 hour";

/**
 * Offers an `index-profile` job for every mined profile transaction that is
 * not stored with its block yet. Only transactions uploaded by this server's
 * Arweave key are considered: the API verified them before uploading, so an
 * old signed profile republished by someone else is never indexed.
 */
export const scanProfileTransactions = Effect.gen(function* () {
  const db = yield* Database;
  const config = yield* AppConfig;
  const arweave = yield* ArweaveService;

  const [latest] = yield* db
    .select({ blockHeight: max(profile.arweaveBlockHeight) })
    .from(profile)
    .pipe(Effect.orDie);

  const minBlockHeight = Math.max(
    0,
    (latest?.blockHeight ?? 0) - PROFILE_INDEX_RESCAN_BLOCKS,
  );

  let after: string | null = null;
  let offered = 0;

  do {
    const page: ArweaveTransactionsPage = yield* arweave.queryTransactions({
      owners: [arweave.ownerAddress],
      tags: [
        { name: ArweaveTags.appName, value: config.APP_ID },
        { name: ArweaveTags.type, value: ArweaveTransactionTypes.profile },
      ],
      minBlockHeight,
      after: after ?? undefined,
    });

    const mined = page.transactions.flatMap((transaction) => {
      // The owner filter is applied by the gateway; double check it so a
      // misbehaving gateway can't make us index foreign transactions.
      if (transaction.ownerAddress !== arweave.ownerAddress) {
        return [];
      }

      return transaction.blockHeight === null
        ? []
        : [{ txId: transaction.id, blockHeight: transaction.blockHeight }];
    });

    const confirmed =
      mined.length === 0
        ? []
        : yield* db
            .select({ arweaveTxId: profile.arweaveTxId })
            .from(profile)
            .where(
              and(
                inArray(
                  profile.arweaveTxId,
                  mined.map((transaction) => transaction.txId),
                ),
                isNotNull(profile.arweaveBlockHeight),
              ),
            )
            .pipe(Effect.orDie);

    const confirmedIds = new Set(confirmed.map((row) => row.arweaveTxId));

    for (const transaction of mined) {
      if (confirmedIds.has(transaction.txId)) {
        // Already stored with its block, nothing to index.
        // oxlint-disable-next-line no-continue
        continue;
      }

      yield* indexProfileJob
        .offer(transaction, { id: indexProfileJobId(transaction.txId) })
        .pipe(Effect.orDie);

      offered++;
    }

    after = page.nextCursor;
  } while (after !== null);

  if (offered > 0) {
    yield* Effect.logInfo("Offered profile index jobs", {
      minBlockHeight,
      offered,
    });
  }

  return { minBlockHeight, offered };
});

export const ProfileIndexScanLive = Layer.effectDiscard(
  scanProfileTransactions.pipe(
    Effect.catchCause((cause) =>
      Effect.logWarning("Profile index scan failed", cause),
    ),
    Effect.repeat(Schedule.spaced(PROFILE_INDEX_INTERVAL)),
    Effect.interruptible,
    Effect.forkScoped,
  ),
).pipe(Layer.provideMerge(indexProfileJob.layer));
