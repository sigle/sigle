import { describe, expect, it } from "@effect/vitest";
import { asc } from "drizzle-orm";
import { Effect, Layer } from "effect";
import { Database } from "@/db";
import { post } from "@/db/schema";
import { ArweaveService, BLOCK_HEIGHTS_MAX_IDS } from "@/services/arweave";
import { createTestPost, createTestUser } from "@/test/helpers";
import { TestDatabaseLayer } from "@/test/layer";
import { recordPostArweaveBlocks } from "./post-arweave-block";

const makeTestLayer = (blockHeights: ReadonlyMap<string, number>) =>
  Layer.mergeAll(
    ArweaveService.layerTest([], undefined, blockHeights),
    TestDatabaseLayer,
  );

const readBlockHeights = Effect.gen(function* () {
  const db = yield* Database;

  const rows = yield* db
    .select({ id: post.id, arweaveBlockHeight: post.arweaveBlockHeight })
    .from(post)
    .orderBy(asc(post.id))
    .pipe(Effect.orDie);

  return Object.fromEntries(
    rows.map((row) => [row.id, row.arweaveBlockHeight]),
  );
});

describe("post Arweave block heights", () => {
  it.effect("records the block of mined posts and keeps the others", () =>
    Effect.gen(function* () {
      const user = yield* createTestUser();

      yield* createTestPost({ id: "post-mined", userId: user.id });
      yield* createTestPost({ id: "post-pending", userId: user.id });
      yield* createTestPost({
        id: "post-recorded",
        userId: user.id,
        arweaveBlockHeight: 1_500_000,
      });

      const result = yield* recordPostArweaveBlocks;

      expect({ result, blockHeights: yield* readBlockHeights }).toStrictEqual({
        result: { recorded: 1 },
        blockHeights: {
          "post-mined": 1_587_342,
          "post-pending": null,
          "post-recorded": 1_500_000,
        },
      });
    }).pipe(
      Effect.provide(
        makeTestLayer(
          new Map([
            ["post-mined", 1_587_342],
            // Already recorded posts are not looked up again.
            ["post-recorded", 1_600_000],
          ]),
        ),
      ),
    ),
  );

  it.effect("checks every pending post past the first page", () => {
    // Sorted last by id, so it is on the second page.
    const lastPostId = `post-${String(BLOCK_HEIGHTS_MAX_IDS).padStart(3, "0")}`;

    return Effect.gen(function* () {
      const user = yield* createTestUser();
      // Same creation time for every post, so pages only advance by id.
      const createdAt = new Date("2026-11-24T09:00:00.000Z");

      for (let index = 0; index <= BLOCK_HEIGHTS_MAX_IDS; index++) {
        yield* createTestPost({
          id: `post-${String(index).padStart(3, "0")}`,
          userId: user.id,
          createdAt,
        });
      }

      const result = yield* recordPostArweaveBlocks;
      const blockHeights = yield* readBlockHeights;

      expect({
        result,
        lastPost: blockHeights[lastPostId],
        firstPost: blockHeights["post-000"],
      }).toStrictEqual({
        result: { recorded: 1 },
        lastPost: 1_587_400,
        firstPost: null,
      });
    }).pipe(Effect.provide(makeTestLayer(new Map([[lastPostId, 1_587_400]]))));
  });
});
