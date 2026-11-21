import { and, eq, gte, inArray, ne, sql } from "drizzle-orm";
import { Effect } from "effect";
import type { DatabaseClient } from "@/db";
import type { UserPlan } from "@/services/plan";
import { draft, post } from "@/db/schema";

/** Posts a user can publish per {@link PUBLISH_LIMIT_WINDOW_MILLIS}. */
export const PUBLISH_LIMITS: Record<UserPlan, number> = {
  free: 3,
  pro: 20,
};

/** Rolling window of the publish limit. */
export const PUBLISH_LIMIT_WINDOW_MILLIS = 24 * 60 * 60 * 1000;

/**
 * First key of the advisory locks serializing the publishes of a user, the
 * second being the hash of their id.
 */
const PUBLISH_LIMIT_LOCK_NAMESPACE = 1_886_547_815;

export interface PublishUsage {
  /** Publishes counted against the limit. */
  readonly used: number;
  /** When the oldest counted publish leaves the window, null when none. */
  readonly resetsAt: Date | null;
}

/**
 * Publishes of a user counted against their daily limit: the posts they
 * published in the window, and the drafts they are publishing, so parallel
 * publishes cannot exceed it. Failed publishes do not count. `excludeDraftId`
 * leaves out the draft being published, whose earlier publish request it
 * replaces.
 *
 * A single statement, so a draft finalized into a post meanwhile is counted
 * once.
 */
export const findPublishUsage = (
  db: DatabaseClient,
  options: {
    readonly userId: string;
    readonly now: Date;
    readonly excludeDraftId?: string;
  },
) =>
  Effect.gen(function* () {
    const windowStart = new Date(
      options.now.getTime() - PUBLISH_LIMIT_WINDOW_MILLIS,
    );

    const rows = yield* db
      .select({ at: post.createdAt })
      .from(post)
      .where(
        and(eq(post.userId, options.userId), gte(post.createdAt, windowStart)),
      )
      .unionAll(
        db
          .select({ at: draft.updatedAt })
          .from(draft)
          .where(
            and(
              eq(draft.userId, options.userId),
              inArray(draft.txStatus, ["PENDING", "PROCESSING"]),
              // A publish stuck in flight for a day no longer counts.
              gte(draft.updatedAt, windowStart),
              options.excludeDraftId === undefined
                ? undefined
                : ne(draft.id, options.excludeDraftId),
            ),
          ),
      )
      .pipe(Effect.orDie);

    const oldest = Math.min(...rows.map((row) => row.at.getTime()));

    return {
      used: rows.length,
      resetsAt:
        rows.length === 0
          ? null
          : new Date(oldest + PUBLISH_LIMIT_WINDOW_MILLIS),
    } satisfies PublishUsage;
  });

/**
 * Locks the publishes of a user until the transaction of `tx` ends, so
 * concurrent publishes count each other.
 */
export const lockUserPublishes = (tx: DatabaseClient, userId: string) =>
  tx
    .select({
      locked: sql<unknown>`pg_advisory_xact_lock(${PUBLISH_LIMIT_LOCK_NAMESPACE}, hashtext(${userId}))`,
    })
    .from(sql`(values (1)) as lock`)
    .pipe(Effect.orDie, Effect.asVoid);
