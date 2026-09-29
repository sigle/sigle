import { describe, expect, it } from "@effect/vitest";
import { ProfileMetadataSchemaId } from "@sigle/sdk";
import { Effect, Option, Schema } from "effect";
import {
  Headers,
  HttpClient,
  HttpClientRequest,
  HttpClientResponse,
} from "effect/unstable/http";
import sharp from "sharp";
import type { PostHogEvent } from "@/services/posthog";
import {
  ARWEAVE_TEST_UPLOAD,
  ARWEAVE_TEST_UPLOAD_ID,
  ArweaveService,
  ArweaveUploadError,
  type ArweaveUploadOptions,
} from "@/services/arweave";
import {
  StorageService,
  StorageUploadError,
  type StorageUploadOptions,
  STORAGE_TEST_PUBLIC_URL,
} from "@/services/storage";
import { createAuthenticatedClient } from "@/test/helpers";
import { makeTestServerLayer } from "@/test/server";

const UploadProfileMetadataResponse = Schema.Struct({
  id: Schema.String,
  uri: Schema.String,
  cid: Schema.String,
  gatewayUrl: Schema.String,
});

const UploadProfileImageResponse = Schema.Struct({ url: Schema.String });

const ErrorResponse = Schema.Struct({ message: Schema.String });

const UPLOAD_AVATAR_PATH = "/api/protected/user/profile/upload-avatar";

const UPLOAD_COVER_PATH = "/api/protected/user/profile/upload-cover";

const makePngBuffer = (width = 16, height = 16) =>
  sharp({
    create: {
      width,
      height,
      channels: 4,
      background: { r: 255, g: 0, b: 0, alpha: 1 },
    },
  })
    .png()
    .toBuffer();

interface UploadImageInput {
  readonly bytes: Uint8Array<ArrayBuffer>;
  readonly contentType: string;
  readonly filename: string;
}

const uploadImageRequest = (
  client: HttpClient.HttpClient,
  path: string,
  file: UploadImageInput,
) => {
  const formData = new FormData();
  formData.append(
    "file",
    new Blob([file.bytes], { type: file.contentType }),
    file.filename,
  );

  return client.execute(
    HttpClientRequest.post(path).pipe(HttpClientRequest.bodyFormData(formData)),
  );
};

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
        makeTestServerLayer({}, events, {
          arweave: ArweaveService.layerTest(uploads),
        }),
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
    }).pipe(
      Effect.provide(makeTestServerLayer({}, [], { arweave: arweaveLayer })),
    );
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

  it.effect(
    "POST upload-avatar stores a resized webp under the user key",
    () => {
      const uploads: Array<StorageUploadOptions> = [];
      const events: Array<PostHogEvent> = [];

      return Effect.gen(function* () {
        const { client, userId } = yield* createAuthenticatedClient();
        const png = yield* Effect.promise(() => makePngBuffer(1200, 600));

        const response = yield* uploadImageRequest(client, UPLOAD_AVATAR_PATH, {
          bytes: new Uint8Array(png),
          contentType: "image/png",
          filename: "avatar.png",
        });

        const body = yield* HttpClientResponse.schemaBodyJson(
          UploadProfileImageResponse,
        )(response);

        const uploaded = uploads[0];
        const uploadedBytes = Buffer.from(uploaded?.body ?? new Uint8Array());

        const metadata = yield* Effect.promise(() =>
          sharp(uploadedBytes).metadata(),
        );

        const key = `u/${userId}/avatar.webp`;

        expect({
          status: response.status,
          key: uploaded?.key,
          contentType: uploaded?.contentType,
          width: metadata.width,
          height: metadata.height,
          isWebp: uploadedBytes.subarray(8, 12).toString() === "WEBP",
          versioned: body.url.startsWith(
            `${STORAGE_TEST_PUBLIC_URL}/${key}?v=`,
          ),
          events,
        }).toStrictEqual({
          status: 200,
          key,
          contentType: "image/webp",
          width: 600,
          height: 300,
          isWebp: true,
          versioned: true,
          events: [
            {
              distinctId: userId,
              event: "profile media uploaded",
              properties: {
                key,
                sizeBytes: uploadedBytes.length,
                url: body.url,
              },
            },
          ],
        });
      }).pipe(
        Effect.provide(
          makeTestServerLayer({}, events, {
            arweave: ArweaveService.layerTest(),
            storage: StorageService.layerTest(uploads),
          }),
        ),
      );
    },
  );

  it.effect("POST upload-cover stores a webp under the cover key", () => {
    const uploads: Array<StorageUploadOptions> = [];
    const events: Array<PostHogEvent> = [];

    return Effect.gen(function* () {
      const { client, userId } = yield* createAuthenticatedClient();
      const png = yield* Effect.promise(() => makePngBuffer(100, 50));

      const response = yield* uploadImageRequest(client, UPLOAD_COVER_PATH, {
        bytes: new Uint8Array(png),
        contentType: "image/jpeg",
        filename: "cover.jpg",
      });

      const body = yield* HttpClientResponse.schemaBodyJson(
        UploadProfileImageResponse,
      )(response);

      const uploaded = uploads[0];
      const uploadedBytes = Buffer.from(uploaded?.body ?? new Uint8Array());

      const metadata = yield* Effect.promise(() =>
        sharp(uploadedBytes).metadata(),
      );

      const key = `u/${userId}/cover.webp`;

      expect({
        status: response.status,
        key: uploaded?.key,
        contentType: uploaded?.contentType,
        width: metadata.width,
        isWebp: uploadedBytes.subarray(8, 12).toString() === "WEBP",
        versioned: body.url.startsWith(`${STORAGE_TEST_PUBLIC_URL}/${key}?v=`),
        events,
      }).toStrictEqual({
        status: 200,
        key,
        contentType: "image/webp",
        width: 100,
        isWebp: true,
        versioned: true,
        events: [
          {
            distinctId: userId,
            event: "profile cover media uploaded",
            properties: {
              key,
              sizeBytes: uploadedBytes.length,
              url: body.url,
            },
          },
        ],
      });
    }).pipe(
      Effect.provide(
        makeTestServerLayer({}, events, {
          arweave: ArweaveService.layerTest(),
          storage: StorageService.layerTest(uploads),
        }),
      ),
    );
  });

  it.effect(
    "POST upload-avatar replaces the same object key on re-upload",
    () => {
      const uploads: Array<StorageUploadOptions> = [];

      return Effect.gen(function* () {
        const { client, userId } = yield* createAuthenticatedClient();
        const png = yield* Effect.promise(() => makePngBuffer());

        const first = yield* uploadImageRequest(client, UPLOAD_AVATAR_PATH, {
          bytes: new Uint8Array(png),
          contentType: "image/png",
          filename: "avatar.png",
        });

        const second = yield* uploadImageRequest(client, UPLOAD_AVATAR_PATH, {
          bytes: new Uint8Array(png),
          contentType: "image/png",
          filename: "avatar.png",
        });

        expect({
          statuses: [first.status, second.status],
          keys: uploads.map((upload) => upload.key),
        }).toStrictEqual({
          statuses: [200, 200],
          keys: [`u/${userId}/avatar.webp`, `u/${userId}/avatar.webp`],
        });
      }).pipe(
        Effect.provide(
          makeTestServerLayer({}, [], {
            arweave: ArweaveService.layerTest(),
            storage: StorageService.layerTest(uploads),
          }),
        ),
      );
    },
  );

  it.effect("POST upload-avatar rejects unsupported content types", () =>
    Effect.gen(function* () {
      const { client } = yield* createAuthenticatedClient();

      const response = yield* uploadImageRequest(client, UPLOAD_AVATAR_PATH, {
        bytes: new Uint8Array([1, 2, 3]),
        contentType: "text/plain",
        filename: "avatar.txt",
      });

      const body =
        yield* HttpClientResponse.schemaBodyJson(ErrorResponse)(response);

      expect({ status: response.status, message: body.message }).toStrictEqual({
        status: 400,
        message: "Unsupported image format: text/plain",
      });
    }).pipe(Effect.provide(makeTestServerLayer())),
  );

  it.effect("POST upload-avatar rejects files larger than 5 MiB", () =>
    Effect.gen(function* () {
      const { client } = yield* createAuthenticatedClient();

      const response = yield* uploadImageRequest(client, UPLOAD_AVATAR_PATH, {
        bytes: new Uint8Array(6 * 1024 * 1024),
        contentType: "image/png",
        filename: "avatar.png",
      });

      expect(response.status).toBe(413);
    }).pipe(Effect.provide(makeTestServerLayer())),
  );

  it.effect("POST upload-avatar rejects requests without a file", () =>
    Effect.gen(function* () {
      const { client } = yield* createAuthenticatedClient();

      const response = yield* client.execute(
        HttpClientRequest.post(UPLOAD_AVATAR_PATH).pipe(
          HttpClientRequest.bodyFormData(new FormData()),
        ),
      );

      expect(response.status).toBe(400);
    }).pipe(Effect.provide(makeTestServerLayer())),
  );

  it.effect("POST upload-avatar returns 401 without a session", () =>
    Effect.gen(function* () {
      const client = yield* HttpClient.HttpClient;
      const png = yield* Effect.promise(() => makePngBuffer());

      const response = yield* uploadImageRequest(client, UPLOAD_AVATAR_PATH, {
        bytes: new Uint8Array(png),
        contentType: "image/png",
        filename: "avatar.png",
      });

      expect(response.status).toBe(401);
    }).pipe(Effect.provide(makeTestServerLayer())),
  );

  it.effect("POST upload-avatar returns 500 when storage fails", () => {
    const storageLayer = StorageService.layerTest([], () =>
      Effect.fail(
        new StorageUploadError({
          cause: new Error("r2 unreachable"),
          message: "r2 unreachable",
        }),
      ),
    );

    return Effect.gen(function* () {
      const { client } = yield* createAuthenticatedClient();
      const png = yield* Effect.promise(() => makePngBuffer());

      const response = yield* uploadImageRequest(client, UPLOAD_AVATAR_PATH, {
        bytes: new Uint8Array(png),
        contentType: "image/png",
        filename: "avatar.png",
      });

      const body =
        yield* HttpClientResponse.schemaBodyJson(ErrorResponse)(response);

      expect({ status: response.status, message: body.message }).toStrictEqual({
        status: 500,
        message: "Failed to upload image, error: r2 unreachable",
      });
    }).pipe(
      Effect.provide(
        makeTestServerLayer({}, [], {
          arweave: ArweaveService.layerTest(),
          storage: storageLayer,
        }),
      ),
    );
  });

  it.effect("POST upload-avatar is limited to 4 requests per minute", () => {
    const uploads: Array<StorageUploadOptions> = [];

    return Effect.gen(function* () {
      const { client } = yield* createAuthenticatedClient();
      const png = yield* Effect.promise(() => makePngBuffer());

      const responses = yield* Effect.forEach(
        Array.from({ length: 5 }, (_, index) => index),
        () =>
          uploadImageRequest(client, UPLOAD_AVATAR_PATH, {
            bytes: new Uint8Array(png),
            contentType: "image/png",
            filename: "avatar.png",
          }),
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
    }).pipe(
      Effect.provide(
        makeTestServerLayer({}, [], {
          arweave: ArweaveService.layerTest(),
          storage: StorageService.layerTest(uploads),
        }),
      ),
    );
  });
});
