import { describe, expect, it } from "@effect/vitest";
import { eq } from "drizzle-orm";
import { Effect, Layer } from "effect";
import { Database } from "@/db";
import { post } from "@/db/schema";
import {
  ArweaveBlockPendingError,
  processUpdateArweaveBlockHeightJob,
} from "@/jobs/update-arweave-block-height";
import {
  type ArweaveGraphQLTestResponse,
  ArweaveGraphQLService,
} from "@/services/arweave-graphql";
import { createTestPost, createTestUser } from "@/test/helpers";
import { TestDatabaseLayer } from "@/test/layer";

const makeTestLayer = (respond: () => ArweaveGraphQLTestResponse) =>
  ArweaveGraphQLService.layerTest(respond).pipe(
    Layer.provideMerge(TestDatabaseLayer),
  );

const respondWithBlock = (
  block: { height: number; timestamp: number } | null,
): ArweaveGraphQLTestResponse => ({
  body: {
    data: {
      transactions: {
        edges: [{ cursor: "cursor-1", node: { id: "tx-1", block } }],
      },
    },
  },
});

const findPost = (id: string) =>
  Effect.gen(function* () {
    const db = yield* Database;

    const [row] = yield* db
      .select()
      .from(post)
      .where(eq(post.id, id))
      .limit(1)
      .pipe(Effect.orDie);

    return row;
  });

describe("update arweave block height job", () => {
  it.effect("stores the mined block height", () => {
    return Effect.gen(function* () {
      const user = yield* createTestUser();

      yield* createTestPost({
        id: "post-1",
        userId: user.id,
        arweaveTxId: "tx-1",
        arweaveBlockHeight: null,
      });

      yield* processUpdateArweaveBlockHeightJob({ postId: "post-1" });

      const updated = yield* findPost("post-1");

      expect(updated?.arweaveBlockHeight).toBe(99);
    }).pipe(
      Effect.provide(
        makeTestLayer(() =>
          respondWithBlock({ height: 99, timestamp: 1_700_000_000 }),
        ),
      ),
    );
  });

  it.effect("does nothing when the height is already known", () => {
    let fetchCount = 0;

    return Effect.gen(function* () {
      const user = yield* createTestUser();

      yield* createTestPost({
        id: "post-1",
        userId: user.id,
        arweaveTxId: "tx-1",
        arweaveBlockHeight: 42,
      });

      yield* processUpdateArweaveBlockHeightJob({ postId: "post-1" });

      const unchanged = yield* findPost("post-1");

      expect({
        fetchCount,
        arweaveBlockHeight: unchanged?.arweaveBlockHeight,
      }).toStrictEqual({
        fetchCount: 0,
        arweaveBlockHeight: 42,
      });
    }).pipe(
      Effect.provide(
        makeTestLayer(() => {
          fetchCount += 1;

          return respondWithBlock(null);
        }),
      ),
    );
  });

  it.effect("fails with a retryable error while the block is pending", () => {
    return Effect.gen(function* () {
      const user = yield* createTestUser();

      yield* createTestPost({
        id: "post-1",
        userId: user.id,
        arweaveTxId: "tx-1",
        arweaveBlockHeight: null,
      });

      const result = yield* processUpdateArweaveBlockHeightJob({
        postId: "post-1",
      }).pipe(
        Effect.match({
          onFailure: (error) =>
            error instanceof ArweaveBlockPendingError
              ? { isPending: true, postId: error.postId, txId: error.txId }
              : { isPending: false, postId: "", txId: "" },
          onSuccess: () => ({ isPending: false, postId: "", txId: "" }),
        }),
      );

      const pending = yield* findPost("post-1");

      expect({
        ...result,
        arweaveBlockHeight: pending?.arweaveBlockHeight,
      }).toStrictEqual({
        isPending: true,
        postId: "post-1",
        txId: "tx-1",
        arweaveBlockHeight: null,
      });
    }).pipe(Effect.provide(makeTestLayer(() => respondWithBlock(null))));
  });

  it.effect("does nothing when the post is gone", () => {
    let fetchCount = 0;

    return Effect.gen(function* () {
      yield* processUpdateArweaveBlockHeightJob({ postId: "post-1" });

      expect(fetchCount).toBe(0);
    }).pipe(
      Effect.provide(
        makeTestLayer(() => {
          fetchCount += 1;

          return respondWithBlock(null);
        }),
      ),
    );
  });
});
