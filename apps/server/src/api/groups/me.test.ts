import { describe, expect, it } from "@effect/vitest";
import { Effect, Schema } from "effect";
import { HttpClientResponse } from "effect/http";
import {
  createAuthenticatedClient,
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
