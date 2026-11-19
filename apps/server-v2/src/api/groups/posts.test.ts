import { describe, expect, it } from "@effect/vitest";
import { Effect, Schema } from "effect";
import { HttpClient, HttpClientResponse } from "effect/http";
import { PostListResponse } from "@/api/groups/posts";
import {
  createTestMediaImage,
  createTestPost,
  createTestPostOts,
  createTestProfile,
  createTestUser,
  createTestWalletAddress,
} from "@/test/helpers";
import { makeTestServerLayer } from "@/test/server";

const ErrorResponse = Schema.Struct({ message: Schema.String });

const ListPath = Schema.Struct({
  get: Schema.Struct({
    parameters: Schema.Array(
      Schema.Struct({ name: Schema.String, schema: Schema.Unknown }),
    ),
  }),
});

const OpenApiListPaths = Schema.Struct({
  paths: Schema.Struct({
    "/api/posts": ListPath,
    "/api/protected/drafts": ListPath,
  }),
});

const AUTHOR_ADDRESS = "ST1PQHQKV0RJXZFY1DGX8MNSNYVE3VGZJSRTPGZGM";

const OTHER_ADDRESS = "ST2CY5V39NHDPWSXMW9QDT3HC3GD6Q6XX4CFRK9AG";

const createAuthorPosts = (address: string, titles: ReadonlyArray<string>) =>
  Effect.gen(function* () {
    const user = yield* createTestUser();
    yield* createTestWalletAddress({ userId: user.id, address });

    // Titles are listed oldest first, a minute apart.
    yield* Effect.forEach(titles, (title, index) =>
      createTestPost({
        userId: user.id,
        title,
        createdAt: new Date(Date.UTC(2026, 0, 1, 0, index)),
      }),
    );
  });

describe("posts", () => {
  it.effect("GET /api/posts pages through posts newest first", () =>
    Effect.gen(function* () {
      const client = yield* HttpClient.HttpClient;
      yield* createAuthorPosts(AUTHOR_ADDRESS, ["first", "second", "third"]);

      const response = yield* client.get("/api/posts?limit=2&offset=1");

      const body =
        yield* HttpClientResponse.schemaBodyJson(PostListResponse)(response);

      expect({
        status: response.status,
        titles: body.results.map((item) => item.title),
        limit: body.limit,
        offset: body.offset,
        total: body.total,
      }).toStrictEqual({
        status: 200,
        titles: ["second", "first"],
        limit: 2,
        offset: 1,
        total: 3,
      });
    }).pipe(Effect.provide(makeTestServerLayer())),
  );

  it.effect("GET /api/posts filters by author address", () =>
    Effect.gen(function* () {
      const client = yield* HttpClient.HttpClient;
      yield* createAuthorPosts(AUTHOR_ADDRESS, ["author old", "author new"]);
      yield* createAuthorPosts(OTHER_ADDRESS, ["other"]);

      // A non-canonical spelling of the author address (`O` for `0`) still
      // matches the stored wallet.
      const response = yield* client.get(
        `/api/posts?username=${AUTHOR_ADDRESS.replaceAll("0", "O")}&limit=1`,
      );

      const body =
        yield* HttpClientResponse.schemaBodyJson(PostListResponse)(response);

      expect({
        titles: body.results.map((item) => item.title),
        total: body.total,
      }).toStrictEqual({ titles: ["author new"], total: 2 });
    }).pipe(Effect.provide(makeTestServerLayer())),
  );

  it.effect("GET /api/posts rejects invalid query values", () =>
    Effect.gen(function* () {
      const client = yield* HttpClient.HttpClient;

      const statuses = yield* Effect.forEach(
        ["username=not-an-address", "limit=0", "limit=101", "limit=2.5"],
        (query) =>
          client
            .get(`/api/posts?${query}`)
            .pipe(Effect.map((response) => response.status)),
      );

      const invalidAddress = yield* client
        .get("/api/posts?username=not-an-address")
        .pipe(Effect.flatMap(HttpClientResponse.schemaBodyJson(ErrorResponse)));

      expect({ statuses, message: invalidAddress.message }).toStrictEqual({
        statuses: [400, 400, 400, 400],
        message: "Invalid Stacks address",
      });
    }).pipe(Effect.provide(makeTestServerLayer())),
  );

  it.effect("documents pagination query parameters as integers", () =>
    Effect.gen(function* () {
      const client = yield* HttpClient.HttpClient;

      const response = yield* client.get("/_openapi.json");

      const spec =
        yield* HttpClientResponse.schemaBodyJson(OpenApiListPaths)(response);

      const parameters = (path: keyof typeof spec.paths) =>
        Object.fromEntries(
          spec.paths[path].get.parameters.map((parameter) => [
            parameter.name,
            parameter.schema,
          ]),
        );

      expect({
        posts: parameters("/api/posts"),
        drafts: parameters("/api/protected/drafts"),
      }).toStrictEqual({
        posts: {
          username: { type: "string" },
          limit: { type: "integer", minimum: 1, maximum: 100 },
          offset: { type: "integer", minimum: 0 },
        },
        drafts: {
          limit: { type: "integer", minimum: 1, maximum: 100 },
          offset: { type: "integer", minimum: 0 },
        },
      });
    }).pipe(Effect.provide(makeTestServerLayer())),
  );

  it.effect(
    "GET /api/posts/:postId returns the post with its cover, author and proof",
    () =>
      Effect.gen(function* () {
        const client = yield* HttpClient.HttpClient;
        const user = yield* createTestUser();
        const coverImage = "https://cdn.test/posts/cover.webp";

        // The older wallet is not the primary one, so the author must be read
        // from the primary wallet rather than the first linked.
        yield* createTestWalletAddress({
          userId: user.id,
          address: OTHER_ADDRESS,
          isPrimary: false,
        });
        yield* createTestWalletAddress({
          userId: user.id,
          address: AUTHOR_ADDRESS,
          chainId: 1,
        });
        yield* createTestProfile({
          address: AUTHOR_ADDRESS,
          arweaveTxId: "profile-tx",
          displayName: "Author",
        });
        yield* createTestProfile({
          address: OTHER_ADDRESS,
          arweaveTxId: "other-profile-tx",
          displayName: "Other wallet",
        });
        yield* createTestMediaImage({
          id: coverImage,
          status: "READY",
          width: 1200,
          height: 630,
          thumbhash: "cover-thumbhash",
        });
        yield* createTestPost({
          id: "post-tx",
          userId: user.id,
          title: "Hello",
          content: "Hello **world**",
          excerpt: "Hello world",
          arweaveBlockHeight: 1500,
          coverImage,
          tags: ["web3"],
          createdAt: new Date("2026-01-01T00:00:00.000Z"),
        });
        yield* createTestPostOts({
          postId: "post-tx",
          status: "UPGRADED",
          otsTxId: "ots-tx",
          bitcoinBlockHeight: 900_000,
          bitcoinTimestamp: new Date("2026-01-01T02:00:00.000Z"),
        });

        const response = yield* client.get("/api/posts/post-tx");
        const body = yield* response.json;

        expect({ status: response.status, body }).toMatchObject({
          status: 200,
          body: {
            id: "post-tx",
            title: "Hello",
            content: "Hello **world**",
            excerpt: "Hello world",
            metaTitle: null,
            coverImage: {
              url: coverImage,
              width: 1200,
              height: 630,
              thumbhash: "cover-thumbhash",
            },
            tags: ["web3"],
            metadataUri: "ar://post-tx",
            arweaveTxId: "post-tx",
            arweaveBlockHeight: 1500,
            createdAt: "2026-01-01T00:00:00.000Z",
            author: {
              address: AUTHOR_ADDRESS,
              profile: { displayName: "Author", arweaveTxId: "profile-tx" },
            },
            opentimestamps: {
              status: "UPGRADED",
              otsTxId: "ots-tx",
              bitcoinBlockHeight: 900_000,
              bitcoinTimestamp: "2026-01-01T02:00:00.000Z",
            },
          },
        });
      }).pipe(Effect.provide(makeTestServerLayer())),
  );

  it.effect(
    "GET /api/posts/:postId returns nulls before images, profile and proof exist",
    () =>
      Effect.gen(function* () {
        const client = yield* HttpClient.HttpClient;
        const user = yield* createTestUser();
        yield* createTestWalletAddress({
          userId: user.id,
          address: AUTHOR_ADDRESS,
        });
        yield* createTestPost({ id: "bare-post", userId: user.id });

        const response = yield* client.get("/api/posts/bare-post");
        const body = yield* response.json;

        expect(body).toMatchObject({
          coverImage: null,
          tags: [],
          arweaveBlockHeight: null,
          author: { address: AUTHOR_ADDRESS, profile: null },
          opentimestamps: null,
        });
      }).pipe(Effect.provide(makeTestServerLayer())),
  );

  it.effect("GET /api/posts/:postId returns 404 for an unknown post", () =>
    Effect.gen(function* () {
      const client = yield* HttpClient.HttpClient;

      const response = yield* client.get("/api/posts/missing");

      const body =
        yield* HttpClientResponse.schemaBodyJson(ErrorResponse)(response);

      expect({ status: response.status, message: body.message }).toStrictEqual({
        status: 404,
        message: "Post not found",
      });
    }).pipe(Effect.provide(makeTestServerLayer())),
  );
});
