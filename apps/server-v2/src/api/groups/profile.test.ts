import { describe, expect, it } from "@effect/vitest";
import { ProfileMetadataSchemaId } from "@sigle/sdk";
import { Effect, ErrorReporter, Layer, Option, Schema } from "effect";
import {
  Headers,
  HttpClient,
  HttpClientRequest,
  HttpClientResponse,
} from "effect/unstable/http";
import type { PostHogEvent } from "@/services/posthog";
import {
  ARWEAVE_TEST_UPLOAD_ID,
  ArweaveService,
  ArweaveUploadError,
  type ArweaveUploadOptions,
} from "@/services/arweave";
import { makeSentryErrorReporter } from "@/services/telemetry";
import { createAuthenticatedClient } from "@/test/helpers";
import { makeTestServerLayer } from "@/test/server";

const UploadProfileMetadataResponse = Schema.Struct({ id: Schema.String });
const ErrorResponse = Schema.Struct({ message: Schema.String });

const validMetadata = {
  $schema: ProfileMetadataSchemaId.LATEST,
  content: {
    id: "profile-1",
    displayName: "Test profile",
  },
};

const uploadProfileMetadataRequest = (
  client: HttpClient.HttpClient,
  metadata: unknown,
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
        id: body.id,
        contentType: uploaded?.contentType,
        metadata: JSON.parse(
          Buffer.from(uploaded?.file ?? new Uint8Array()).toString(),
        ),
        events,
      }).toStrictEqual({
        status: 200,
        id: ARWEAVE_TEST_UPLOAD_ID,
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

  it.effect(
    "POST upload-metadata reports Arweave failures and returns 500",
    () => {
      const captured: Array<{
        readonly name: string;
        readonly message: string;
      }> = [];

      const reporter = makeSentryErrorReporter({
        captureException: (error) => {
          captured.push({ name: error.name, message: error.message });
        },
      });

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

        expect({
          status: response.status,
          message: body.message,
          captured,
        }).toStrictEqual({
          status: 500,
          message: "Failed to upload to Arweave, error: turbo unreachable",
          captured: [
            {
              name: "sigle/api/InternalServerError",
              message: "Failed to upload to Arweave, error: turbo unreachable",
            },
          ],
        });
      }).pipe(
        Effect.provide(
          makeTestServerLayer({}, [], arweaveLayer).pipe(
            Layer.provide(ErrorReporter.layer([reporter])),
          ),
        ),
      );
    },
  );

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
