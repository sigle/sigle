import { describe, expect, it } from "@effect/vitest";
import { Effect, Option, Schema } from "effect";
import {
  Headers,
  HttpClient,
  HttpClientRequest,
  HttpClientResponse,
} from "effect/http";
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
      Schema.Struct({
        name: Schema.String,
        description: Schema.optionalKey(Schema.String),
        schema: Schema.Unknown,
      }),
    ),
  }),
});

const OpenApiListPaths = Schema.Struct({
  paths: Schema.Struct({
    "/api/posts": ListPath,
    "/api/drafts": ListPath,
  }),
});

const AUTHOR_ADDRESS = "ST1PQHQKV0RJXZFY1DGX8MNSNYVE3VGZJSRTPGZGM";

const OTHER_ADDRESS = "ST2CY5V39NHDPWSXMW9QDT3HC3GD6Q6XX4CFRK9AG";

const NO_PROFILE_ADDRESS = "ST1SJ3DTE5DN7X54YDH5D64R3BCB6A2AG2ZQ8YPD5";

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
        `/api/posts?author=${AUTHOR_ADDRESS.replaceAll("0", "O")}&limit=1`,
      );

      const body =
        yield* HttpClientResponse.schemaBodyJson(PostListResponse)(response);

      expect({
        titles: body.results.map((item) => item.title),
        total: body.total,
      }).toStrictEqual({ titles: ["author new"], total: 2 });
    }).pipe(Effect.provide(makeTestServerLayer())),
  );

  it.effect("GET /api/posts returns each post's author and cover image", () =>
    Effect.gen(function* () {
      const client = yield* HttpClient.HttpClient;
      const coverImage = "https://cdn.test/posts/cover.webp";

      // The author's older wallet is not the primary one and has its own
      // profile, so the author must be read from the primary wallet. The
      // author is on Pro, so they get the Explorer Guild badge.
      const author = yield* createTestUser({ plan: "pro" });
      yield* createTestWalletAddress({
        userId: author.id,
        address: OTHER_ADDRESS,
        isPrimary: false,
      });
      yield* createTestWalletAddress({
        userId: author.id,
        address: AUTHOR_ADDRESS,
        chainId: 1,
      });
      yield* createTestProfile({
        address: AUTHOR_ADDRESS,
        displayName: "Author",
      });
      yield* createTestProfile({
        address: OTHER_ADDRESS,
        displayName: "Other wallet",
      });
      yield* createTestMediaImage({
        id: coverImage,
        width: 1200,
        height: 630,
        thumbhash: "cover-thumbhash",
      });

      const withoutProfile = yield* createTestUser();
      yield* createTestWalletAddress({
        userId: withoutProfile.id,
        address: NO_PROFILE_ADDRESS,
      });

      yield* createTestPost({
        userId: author.id,
        title: "with cover",
        coverImage,
        createdAt: new Date(Date.UTC(2026, 0, 1, 0, 2)),
      });
      yield* createTestPost({
        userId: withoutProfile.id,
        title: "without profile",
        createdAt: new Date(Date.UTC(2026, 0, 1, 0, 1)),
      });

      const response = yield* client.get("/api/posts");

      const body =
        yield* HttpClientResponse.schemaBodyJson(PostListResponse)(response);

      expect(
        body.results.map((item) => ({
          title: item.title,
          coverImage: item.coverImage,
          author: {
            address: item.author.address,
            displayName: item.author.profile?.displayName ?? null,
            isExplorer: item.author.isExplorer,
          },
        })),
      ).toStrictEqual([
        {
          title: "with cover",
          coverImage: {
            url: coverImage,
            width: 1200,
            height: 630,
            thumbhash: "cover-thumbhash",
          },
          author: {
            address: AUTHOR_ADDRESS,
            displayName: "Author",
            isExplorer: true,
          },
        },
        {
          title: "without profile",
          coverImage: null,
          author: {
            address: NO_PROFILE_ADDRESS,
            displayName: null,
            isExplorer: false,
          },
        },
      ]);
    }).pipe(Effect.provide(makeTestServerLayer())),
  );

  it.effect("GET /api/posts fails when an author has no linked wallet", () =>
    Effect.gen(function* () {
      const client = yield* HttpClient.HttpClient;
      yield* createAuthorPosts(AUTHOR_ADDRESS, ["with wallet"]);
      const withoutWallet = yield* createTestUser();
      yield* createTestPost({ userId: withoutWallet.id });

      const response = yield* client.get("/api/posts");

      expect(response.status).toBe(500);
    }).pipe(Effect.provide(makeTestServerLayer())),
  );

  it.effect("GET /api/posts rejects invalid query values", () =>
    Effect.gen(function* () {
      const client = yield* HttpClient.HttpClient;

      const statuses = yield* Effect.forEach(
        ["author=not-an-address", "limit=0", "limit=101", "limit=2.5"],
        (query) =>
          client
            .get(`/api/posts?${query}`)
            .pipe(Effect.map((response) => response.status)),
      );

      const invalidAddress = yield* client
        .get("/api/posts?author=not-an-address")
        .pipe(Effect.flatMap(HttpClientResponse.schemaBodyJson(ErrorResponse)));

      expect({ statuses, message: invalidAddress.message }).toStrictEqual({
        statuses: [400, 400, 400, 400],
        message: "Invalid Stacks address",
      });
    }).pipe(Effect.provide(makeTestServerLayer())),
  );

  it.effect("documents the list query parameters with their defaults", () =>
    Effect.gen(function* () {
      const client = yield* HttpClient.HttpClient;

      const response = yield* client.get("/_openapi.json");

      const spec =
        yield* HttpClientResponse.schemaBodyJson(OpenApiListPaths)(response);

      const parameters = (path: keyof typeof spec.paths) =>
        Object.fromEntries(
          spec.paths[path].get.parameters.map((parameter) => [
            parameter.name,
            { description: parameter.description, schema: parameter.schema },
          ]),
        );

      expect({
        posts: parameters("/api/posts"),
        drafts: parameters("/api/drafts"),
      }).toStrictEqual({
        posts: {
          author: {
            description: "Only list the posts of this Stacks address.",
            schema: { type: "string" },
          },
          limit: {
            description: "Number of results to return.",
            schema: { type: "integer", minimum: 1, maximum: 100, default: 20 },
          },
          offset: {
            description: "Number of results to skip.",
            schema: { type: "integer", minimum: 0, default: 0 },
          },
        },
        drafts: {
          limit: {
            description: "Number of results to return.",
            schema: { type: "integer", minimum: 1, maximum: 100, default: 20 },
          },
          offset: {
            description: "Number of results to skip.",
            schema: { type: "integer", minimum: 0, default: 0 },
          },
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
          displayName: "Author",
        });
        yield* createTestProfile({
          address: OTHER_ADDRESS,
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
          contentHash: "b".repeat(64),
          otsTxId: "ots-tx",
          bitcoinBlockHeight: 900_000,
          bitcoinBlockHash: "block-hash",
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
              profile: { displayName: "Author" },
            },
            // Enums are lowercase in the API.
            opentimestamps: {
              status: "upgraded",
              contentHash: "b".repeat(64),
              otsTxId: "ots-tx",
              bitcoinBlockHeight: 900_000,
              bitcoinBlockHash: "block-hash",
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

  it.effect("GET /api/posts and /api/posts/:postId revalidate by ETag", () =>
    Effect.gen(function* () {
      const client = yield* HttpClient.HttpClient;
      const user = yield* createTestUser();
      yield* createTestWalletAddress({
        userId: user.id,
        address: AUTHOR_ADDRESS,
      });
      yield* createTestPost({ id: "cached-post", userId: user.id });

      const get = (path: string, etag?: string) =>
        client
          .execute(
            HttpClientRequest.get(path).pipe(
              HttpClientRequest.setHeaders(
                etag === undefined ? {} : { "if-none-match": etag },
              ),
            ),
          )
          .pipe(
            Effect.map((response) => ({
              status: response.status,
              cacheControl: Option.getOrUndefined(
                Headers.get(response.headers, "cache-control"),
              ),
              etag: Option.getOrUndefined(
                Headers.get(response.headers, "etag"),
              ),
            })),
          );

      const list = yield* get("/api/posts");
      const post = yield* get("/api/posts/cached-post");

      const revalidated = {
        list: (yield* get("/api/posts", list.etag)).status,
        post: (yield* get("/api/posts/cached-post", post.etag)).status,
      };

      // Any field of the post changes its ETag, such as its proof status.
      yield* createTestPostOts({ postId: "cached-post" });

      const changed = yield* get("/api/posts/cached-post", post.etag);

      expect({
        list,
        post,
        revalidated,
        changed: changed.status,
      }).toStrictEqual({
        list: {
          status: 200,
          cacheControl: "public, max-age=60",
          etag: expect.any(String),
        },
        post: {
          status: 200,
          cacheControl: "public, max-age=60",
          etag: expect.any(String),
        },
        revalidated: { list: 304, post: 304 },
        changed: 200,
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
