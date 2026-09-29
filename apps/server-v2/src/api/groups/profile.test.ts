import { describe, expect, it } from "@effect/vitest";
import { ProfileMetadataSchemaId } from "@sigle/sdk";
import { Effect, Option, Schema } from "effect";
import {
  Headers,
  HttpClient,
  HttpClientRequest,
  HttpClientResponse,
} from "effect/unstable/http";
import type { PostHogEvent } from "@/services/posthog";
import {
  ARWEAVE_TEST_UPLOAD,
  ARWEAVE_TEST_UPLOAD_ID,
  ArweaveService,
  ArweaveUploadError,
  type ArweaveUploadOptions,
} from "@/services/arweave";
import { createAuthenticatedClient } from "@/test/helpers";
import { makeTestServerLayer } from "@/test/server";

const UploadProfileMetadataResponse = Schema.Struct({
  id: Schema.String,
  uri: Schema.String,
  cid: Schema.String,
  gatewayUrl: Schema.String,
});

const ErrorResponse = Schema.Struct({ message: Schema.String });

const validMetadata = {
  $schema: ProfileMetadataSchemaId.LATEST,
  content: {
    id: "profile-1",
    displayName: "Test profile",
  },
};

interface ProfileMetadataInput {
  readonly $schema?: string;
  readonly content?: { readonly id?: string };
}

const uploadProfileMetadataRequest = (
  client: HttpClient.HttpClient,
  metadata: ProfileMetadataInput | undefined,
) =>
  client.execute(
    HttpClientRequest.post("/api/protected/user/profile/upload-metadata").pipe(
      HttpClientRequest.bodyJsonUnsafe({ metadata }),
    ),
  );

describe("profile", () => {
  it.effect("POST upload-metadata uploads metadata to Arweave", () => {
    const uploads: Array<ArweaveUploadOptions> = [];
    const events: Array<PostHogEvent> = [];

    return Effect.gen(function* () {
      const { client, userId } = yield* createAuthenticatedClient();

      const response = yield* uploadProfileMetadataRequest(
        client,
        validMetadata,
      );

      const body = yield* HttpClientResponse.schemaBodyJson(
        UploadProfileMetadataResponse,
      )(response);

      const uploaded = uploads[0];

      expect({
        status: response.status,
        body,
        contentType: uploaded?.contentType,
        metadata: JSON.parse(
          Buffer.from(uploaded?.file ?? new Uint8Array()).toString(),
        ),
        events,
      }).toStrictEqual({
        status: 200,
        body: ARWEAVE_TEST_UPLOAD,
        contentType: "application/json",
        metadata: validMetadata,
        events: [
          {
            distinctId: userId,
            event: "profile metadata uploaded",
            properties: { arweaveId: ARWEAVE_TEST_UPLOAD_ID },
          },
        ],
      });
    }).pipe(
      Effect.provide(
        makeTestServerLayer({}, events, ArweaveService.layerTest(uploads)),
      ),
    );
  });

  it.effect("POST upload-metadata is limited to 4 requests per minute", () =>
    Effect.gen(function* () {
      const { client } = yield* createAuthenticatedClient();

      const responses = yield* Effect.forEach(
        Array.from({ length: 5 }, (_, index) => index),
        () => uploadProfileMetadataRequest(client, validMetadata),
        { concurrency: 1 },
      );

      const first = responses[0];

      const limit =
        first === undefined
          ? undefined
          : Option.getOrUndefined(
              Headers.get(first.headers, "x-ratelimit-limit"),
            );

      expect({
        statuses: responses.map((response) => response.status),
        limit,
      }).toStrictEqual({
        statuses: [200, 200, 200, 200, 429],
        limit: "4",
      });
    }).pipe(Effect.provide(makeTestServerLayer())),
  );

  it.effect("POST upload-metadata rate limits each user independently", () =>
    Effect.gen(function* () {
      const first = yield* createAuthenticatedClient();
      const second = yield* createAuthenticatedClient();

      const firstResponses = yield* Effect.forEach(
        Array.from({ length: 4 }, (_, index) => index),
        () => uploadProfileMetadataRequest(first.client, validMetadata),
        { concurrency: 1 },
      );

      const secondResponse = yield* uploadProfileMetadataRequest(
        second.client,
        validMetadata,
      );

      expect({
        first: firstResponses.map((response) => response.status),
        second: secondResponse.status,
      }).toStrictEqual({
        first: [200, 200, 200, 200],
        second: 200,
      });
    }).pipe(Effect.provide(makeTestServerLayer())),
  );

  it.effect("POST upload-metadata rejects invalid metadata", () =>
    Effect.gen(function* () {
      const { client } = yield* createAuthenticatedClient();

      const responses = yield* Effect.all([
        uploadProfileMetadataRequest(client, { content: { id: "profile-1" } }),
        uploadProfileMetadataRequest(client, {
          $schema: "https://example.com/profile.json",
          content: { id: "profile-1" },
        }),
        uploadProfileMetadataRequest(client, {
          $schema: validMetadata.$schema,
        }),
        uploadProfileMetadataRequest(client, undefined),
      ]);

      expect(responses.map((response) => response.status)).toStrictEqual([
        400, 400, 400, 400,
      ]);
    }).pipe(Effect.provide(makeTestServerLayer())),
  );

  it.effect("POST upload-metadata returns 500 when Arweave fails", () => {
    const arweaveLayer = ArweaveService.layerTest([], () =>
      Effect.fail(
        new ArweaveUploadError({
          cause: new Error("turbo unreachable"),
          message: "turbo unreachable",
        }),
      ),
    );

    return Effect.gen(function* () {
      const { client } = yield* createAuthenticatedClient();

      const response = yield* uploadProfileMetadataRequest(
        client,
        validMetadata,
      );

      const body =
        yield* HttpClientResponse.schemaBodyJson(ErrorResponse)(response);

      expect(response.status).toBe(500);
      expect(body.message).toBe(
        "Failed to upload to Arweave, error: turbo unreachable",
      );
    }).pipe(Effect.provide(makeTestServerLayer({}, [], arweaveLayer)));
  });

  it.effect("POST upload-metadata returns 401 without a session", () =>
    Effect.gen(function* () {
      const client = yield* HttpClient.HttpClient;

      const response = yield* uploadProfileMetadataRequest(
        client,
        validMetadata,
      );

      expect(response.status).toBe(401);
    }).pipe(Effect.provide(makeTestServerLayer())),
  );
});
