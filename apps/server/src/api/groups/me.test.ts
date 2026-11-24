import { describe, expect, it } from "@effect/vitest";
import { Effect, Schema } from "effect";
import { HttpClient, HttpClientRequest, HttpClientResponse } from "effect/http";
import { MyPostListResponse } from "@/api/groups/me";
import { PostListResponse } from "@/api/groups/posts";
import {
  createAuthenticatedClient,
  createTestPost,
  createTestSiwsCredentials,
} from "@/test/helpers";
import { makeTestServerLayer } from "@/test/server";

const PlanBody = Schema.Struct({ plan: Schema.String });

const MessageBody = Schema.Struct({ message: Schema.String });

describe("pOST /api/me/plan/refresh", () => {
  it.effect("activates pro for eligible wallets only", () => {
    const { address: proAddress } = createTestSiwsCredentials();

    return Effect.gen(function* () {
      const { client: proClient } = yield* createAuthenticatedClient({
        address: proAddress,
      });

      const { client: freeClient } = yield* createAuthenticatedClient();

      const getPlan = (client: typeof proClient) =>
        client.get("/api/me").pipe(
          Effect.flatMap(HttpClientResponse.schemaBodyJson(PlanBody)),
          Effect.map((body) => body.plan),
        );

      const before = yield* getPlan(proClient);
      const proResponse = yield* proClient.post("/api/me/plan/refresh");
      const freeResponse = yield* freeClient.post("/api/me/plan/refresh");

      expect({
        before,
        pro: [
          proResponse.status,
          yield* HttpClientResponse.schemaBodyJson(PlanBody)(proResponse),
        ],
        free: [
          freeResponse.status,
          yield* HttpClientResponse.schemaBodyJson(PlanBody)(freeResponse),
        ],
        after: [yield* getPlan(proClient), yield* getPlan(freeClient)],
      }).toStrictEqual({
        before: "free",
        pro: [200, { plan: "pro" }],
        free: [200, { plan: "free" }],
        after: ["pro", "free"],
      });
    }).pipe(
      Effect.provide(makeTestServerLayer({ PRO_ADDRESSES: [proAddress] })),
    );
  });

  it.effect(
    "fails instead of reporting free when the Stacks API is unreachable",
    () =>
      Effect.gen(function* () {
        const { client } = yield* createAuthenticatedClient();

        const response = yield* client.post("/api/me/plan/refresh");

        expect({
          status: response.status,
          body: yield* HttpClientResponse.schemaBodyJson(MessageBody)(response),
        }).toStrictEqual({
          status: 500,
          body: { message: "Failed to check your wallet, please try again." },
        });
      }).pipe(
        Effect.provide(
          makeTestServerLayer({
            STACKS_ENV: "mainnet",
            STACKS_API_URL: "http://127.0.0.1:9",
          }),
        ),
      ),
  );
});

describe("pUT /api/me/posts/:postId/visibility", () => {
  it.effect("hides a post from Sigle until its author shows it again", () =>
    Effect.gen(function* () {
      const anonymous = yield* HttpClient.HttpClient;
      const author = yield* createAuthenticatedClient();
      const other = yield* createAuthenticatedClient();

      yield* createTestPost({
        id: "hidden-post",
        userId: author.userId,
        title: "hidden",
        createdAt: new Date(Date.UTC(2026, 0, 1, 0, 1)),
      });
      yield* createTestPost({
        id: "shown-post",
        userId: author.userId,
        title: "shown",
        createdAt: new Date(Date.UTC(2026, 0, 1, 0, 0)),
      });

      const setHidden = (client: HttpClient.HttpClient, hidden: boolean) =>
        client
          .execute(
            HttpClientRequest.put("/api/me/posts/hidden-post/visibility").pipe(
              HttpClientRequest.bodyJsonUnsafe({ hidden }),
            ),
          )
          .pipe(Effect.map((response) => response.status));

      const publicList = anonymous
        .get(`/api/posts?author=${author.address}`)
        .pipe(
          Effect.flatMap(HttpClientResponse.schemaBodyJson(PostListResponse)),
          Effect.map((body) => ({
            titles: body.results.map((item) => item.title),
            total: body.total,
          })),
        );

      const postStatus = (client: HttpClient.HttpClient) =>
        client
          .get("/api/posts/hidden-post")
          .pipe(Effect.map((response) => response.status));

      const myPosts = author.client.get("/api/me/posts").pipe(
        Effect.flatMap(HttpClientResponse.schemaBodyJson(MyPostListResponse)),
        Effect.map((body) =>
          body.results.map((item) => ({
            title: item.title,
            hidden: item.hiddenAt !== null,
          })),
        ),
      );

      const hiddenByOther = yield* setHidden(other.client, true);
      const hide = yield* setHidden(author.client, true);

      const hidden = {
        list: yield* publicList,
        post: yield* postStatus(anonymous),
        postForAuthor: yield* postStatus(author.client),
        mine: yield* myPosts,
      };

      const show = yield* setHidden(author.client, false);

      const shown = {
        list: yield* publicList,
        post: yield* postStatus(anonymous),
        mine: yield* myPosts,
      };

      expect({ hiddenByOther, hide, hidden, show, shown }).toStrictEqual({
        hiddenByOther: 404,
        hide: 200,
        hidden: {
          list: { titles: ["shown"], total: 1 },
          post: 404,
          postForAuthor: 404,
          mine: [
            { title: "hidden", hidden: true },
            { title: "shown", hidden: false },
          ],
        },
        show: 200,
        shown: {
          list: { titles: ["hidden", "shown"], total: 2 },
          post: 200,
          mine: [
            { title: "hidden", hidden: false },
            { title: "shown", hidden: false },
          ],
        },
      });
    }).pipe(Effect.provide(makeTestServerLayer())),
  );
});
