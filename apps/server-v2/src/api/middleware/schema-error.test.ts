import { describe, expect, it } from "@effect/vitest";
import { Effect } from "effect";
import { HttpClientRequest, HttpClientResponse } from "effect/http";
import { BadRequest } from "@/api/schemas";
import { createAuthenticatedClient } from "@/test/helpers";
import { makeTestServerLayer } from "@/test/server";

describe("schemaErrorMiddleware", () => {
  it.effect("returns a BadRequest body when the request fails decoding", () =>
    Effect.gen(function* () {
      const { client } = yield* createAuthenticatedClient();

      const requests = [
        client.get("/api/posts?limit=0"),
        client.execute(
          HttpClientRequest.post("/api/drafts").pipe(
            HttpClientRequest.bodyJsonUnsafe({ title: 42 }),
          ),
        ),
        client.execute(
          HttpClientRequest.post("/api/drafts").pipe(
            HttpClientRequest.bodyText("{", "application/json"),
          ),
        ),
      ];

      const responses = yield* Effect.forEach(requests, (request) =>
        Effect.gen(function* () {
          const response = yield* request;

          const body =
            yield* HttpClientResponse.schemaBodyJson(BadRequest)(response);

          return { status: response.status, message: body.message };
        }),
      );

      expect(responses).toStrictEqual([
        {
          status: 400,
          message:
            "Invalid request query: limit: Expected a value greater than or equal to 1",
        },
        {
          status: 400,
          message: "Invalid request payload: title: Expected string",
        },
        {
          status: 400,
          message: "Invalid request payload: Expected a valid JSON body",
        },
      ]);
    }).pipe(Effect.provide(makeTestServerLayer())),
  );
});
