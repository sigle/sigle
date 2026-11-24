import { describe, expect, it } from "@effect/vitest";
import { eq } from "drizzle-orm";
import { Effect, Layer, Option, Schema } from "effect";
import {
  Headers,
  HttpClient,
  HttpClientRequest,
  HttpClientResponse,
} from "effect/http";
import sharp from "sharp";
import { afterEach, vi } from "vite-plus/test";
import type { PostHogEvent } from "@/services/posthog";
import { UserProfile } from "@/api/groups/users";
import { RATE_LIMITS } from "@/api/middleware/rate-limit";
import { Database } from "@/db";
import { mediaImage, profile as profileTable } from "@/db/schema";
import { sha256Hex } from "@/lib/hash";
import { BnsLookupError, type BnsName, BnsService } from "@/services/bns";
import {
  makeStorageTestRecorder,
  StorageService,
  StorageUploadError,
  type StorageTestOverrides,
  type StorageTestRecorder,
  STORAGE_TEST_PUBLIC_URL,
} from "@/services/storage";
import {
  createAuthenticatedClient,
  createTestSiwsCredentials,
} from "@/test/helpers";
import { makeTestServerLayer } from "@/test/server";

const UpdateProfileResponse = Schema.Struct({
  address: Schema.String,
  profile: UserProfile,
});

const UploadProfileImageResponse = Schema.Struct({
  url: Schema.String,
  sizeBytes: Schema.Int,
  width: Schema.Int,
  height: Schema.Int,
  thumbhash: Schema.String,
});

const ErrorResponse = Schema.Struct({ message: Schema.String });

const profileImagePath = (kind: string) => `/api/me/profile/images/${kind}`;

/**
 * Polls the media row until the background thumbhash job reaches `status`.
 */
const waitForMediaImageStatus = (id: string, status: string) =>
  Effect.gen(function* () {
    const db = yield* Database;

    for (let attempt = 0; attempt < 200; attempt++) {
      const [row] = yield* db
        .select()
        .from(mediaImage)
        .where(eq(mediaImage.id, id))
        .limit(1)
        .pipe(Effect.orDie);

      if (row?.status === status) {
        return row;
      }

      yield* Effect.sleep("20 millis");
    }

    return undefined;
  });

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

const ONE_PIXEL_GIF = Buffer.from(
  "R0lGODlhAQABAIAAAAAAAP///yH5BAEAAAAALAAAAAABAAEAAAIBRAA7",
  "base64",
);

interface UploadImageInput {
  readonly bytes: Uint8Array<ArrayBuffer>;
  readonly contentType: string;
}

const uploadImageRequest = (
  client: HttpClient.HttpClient,
  kind: string,
  file: UploadImageInput,
) =>
  client.execute(
    HttpClientRequest.put(profileImagePath(kind)).pipe(
      HttpClientRequest.bodyUint8Array(file.bytes, file.contentType),
    ),
  );

const imageServerLayer = (
  recorder: StorageTestRecorder,
  storageOverrides: StorageTestOverrides = {},
  posthogEvents: Array<PostHogEvent> = [],
) =>
  makeTestServerLayer({}, posthogEvents, {
    storage: StorageService.layerTest(recorder, storageOverrides),
  });

type ProfileInput = Readonly<Record<string, string | null>>;

const updateProfileRequest = (
  client: HttpClient.HttpClient,
  payload: ProfileInput,
) =>
  client.execute(
    HttpClientRequest.put("/api/me/profile").pipe(
      HttpClientRequest.bodyJsonUnsafe(payload),
    ),
  );

const getBnsProfileRequest = (client: HttpClient.HttpClient) =>
  client.get("/api/me/profile/bns");

/** A signed-in user whose primary address is `address`. */
const createProfileClient = () =>
  Effect.gen(function* () {
    const { address } = createTestSiwsCredentials();
    const { client, userId } = yield* createAuthenticatedClient({ address });

    return { address, client, userId };
  });

/** The address that owns the BNS name served by `bnsLayer`. */
const BNS_OWNER = createTestSiwsCredentials().address;

const bnsLayer = (zonefile: string) =>
  BnsService.layerTest({
    [BNS_OWNER]: { fullName: "satoshi.btc", zonefile } satisfies BnsName,
  });

const getBnsProfile = (layer: Layer.Layer<BnsService>) =>
  Effect.gen(function* () {
    const { client } = yield* createAuthenticatedClient({
      address: BNS_OWNER,
    });

    const response = yield* getBnsProfileRequest(client);

    return { status: response.status, body: yield* response.json };
  }).pipe(Effect.provide(makeTestServerLayer({}, [], { bns: layer })));

describe("profile", () => {
  afterEach(() => {
    vi.unstubAllGlobals();
  });

  it.effect(
    "PUT /api/me/profile stores the profile of the primary address",
    () => {
      const events: Array<PostHogEvent> = [];

      return Effect.gen(function* () {
        const { address, client, userId } = yield* createProfileClient();
        const db = yield* Database;

        const first = yield* updateProfileRequest(client, {
          displayName: "Satoshi",
          description: "**Hello**",
          website: "https://bitcoin.org",
          twitter: "satoshi",
        });

        const firstBody = yield* HttpClientResponse.schemaBodyJson(
          UpdateProfileResponse,
        )(first);

        // Fields that are omitted or null are cleared.
        const second = yield* updateProfileRequest(client, {
          displayName: "Nakamoto",
          website: null,
        });

        const rows = yield* db
          .select()
          .from(profileTable)
          .where(eq(profileTable.address, address))
          .pipe(Effect.orDie);

        expect({
          statuses: [first.status, second.status],
          firstBody,
          rows,
          events,
        }).toStrictEqual({
          statuses: [200, 200],
          firstBody: {
            address,
            profile: {
              displayName: "Satoshi",
              description: "**Hello**",
              website: "https://bitcoin.org",
              twitter: "satoshi",
              picture: null,
              coverPicture: null,
              updatedAt: expect.anything(),
            },
          },
          rows: [
            {
              address,
              displayName: "Nakamoto",
              description: null,
              website: null,
              twitter: null,
              picture: null,
              coverPicture: null,
              createdAt: expect.any(Date),
              updatedAt: expect.any(Date),
            },
          ],
          events: [
            { distinctId: userId, event: "profile updated" },
            { distinctId: userId, event: "profile updated" },
          ],
        });
      }).pipe(Effect.provide(makeTestServerLayer({}, events)));
    },
  );

  it.live(
    "PUT /api/me/profile schedules thumbhash generation for external pictures",
    () => {
      const imageFetches: Array<string> = [];

      return Effect.gen(function* () {
        const { address, client } = yield* createProfileClient();

        const png = yield* Effect.promise(() => makePngBuffer());

        vi.stubGlobal(
          "fetch",
          vi.fn(async (input: RequestInfo | URL) => {
            imageFetches.push(String(input));

            return new Response(new Uint8Array(png), {
              status: 200,
              headers: { "content-type": "image/png" },
            });
          }),
        );

        const imageUrl = "https://cdn.example.com/external.png";

        const response = yield* updateProfileRequest(client, {
          picture: imageUrl,
        });

        const mediaRow = yield* waitForMediaImageStatus(imageUrl, "READY");

        const db = yield* Database;

        const [savedProfile] = yield* db
          .select()
          .from(profileTable)
          .where(eq(profileTable.address, address))
          .limit(1)
          .pipe(Effect.orDie);

        expect({
          status: response.status,
          mediaStatus: mediaRow?.status,
          thumbhash: mediaRow?.thumbhash,
          picture: savedProfile?.picture,
          fetches: imageFetches,
        }).toStrictEqual({
          status: 200,
          mediaStatus: "READY",
          thumbhash: expect.any(String),
          picture: imageUrl,
          fetches: [imageUrl],
        });
      }).pipe(Effect.provide(makeTestServerLayer()));
    },
  );

  it.effect("PUT /api/me/profile rejects invalid fields", () =>
    Effect.gen(function* () {
      const { address, client } = yield* createProfileClient();
      const db = yield* Database;

      const invalid: ReadonlyArray<ProfileInput> = [
        { displayName: "a".repeat(101) },
        { description: "a".repeat(2001) },
        { website: "data:text/html,hello" },
        { twitter: "not-a-handle" },
        { twitter: "a".repeat(16) },
        { picture: "file:///etc/passwd" },
        { coverPicture: "not a url" },
      ];

      const statuses = yield* Effect.forEach(
        invalid,
        (payload) =>
          updateProfileRequest(client, payload).pipe(
            Effect.map((response) => response.status),
          ),
        { concurrency: 1 },
      );

      const rows = yield* db
        .select()
        .from(profileTable)
        .where(eq(profileTable.address, address))
        .pipe(Effect.orDie);

      // The limits themselves are allowed.
      const atLimits = yield* updateProfileRequest(client, {
        displayName: "a".repeat(100),
        description: "a".repeat(2000),
        twitter: "a".repeat(15),
      });

      expect({ statuses, rows, atLimits: atLimits.status }).toStrictEqual({
        statuses: [400, 400, 400, 400, 400, 400, 400],
        rows: [],
        atLimits: 200,
      });
    }).pipe(Effect.provide(makeTestServerLayer())),
  );

  it.effect("PUT /api/me/profile is rate limited per minute", () =>
    Effect.gen(function* () {
      const { client } = yield* createProfileClient();
      const { points } = RATE_LIMITS.profileUpdate;

      const responses = yield* Effect.forEach(
        Array.from({ length: points + 1 }, (_, index) => index),
        (index) =>
          updateProfileRequest(client, { displayName: `Profile ${index}` }),
        { concurrency: 1 },
      );

      const first = responses[0];

      expect({
        statuses: responses.map((response) => response.status),
        limit:
          first === undefined
            ? undefined
            : Option.getOrUndefined(
                Headers.get(first.headers, "x-ratelimit-limit"),
              ),
      }).toStrictEqual({
        statuses: [...Array.from({ length: points }, () => 200), 429],
        limit: String(points),
      });
    }).pipe(Effect.provide(makeTestServerLayer())),
  );

  it.effect("PUT /api/me/profile returns 401 without a session", () =>
    Effect.gen(function* () {
      const client = yield* HttpClient.HttpClient;

      const responses = yield* Effect.all([
        updateProfileRequest(client, { displayName: "Satoshi" }),
        getBnsProfileRequest(client),
      ]);

      expect(responses.map((response) => response.status)).toStrictEqual([
        401, 401,
      ]);
    }).pipe(Effect.provide(makeTestServerLayer())),
  );

  it.effect("profile routes return 403 for non-whitelisted users", () => {
    const recorder = makeStorageTestRecorder();

    return Effect.gen(function* () {
      const credentials = createTestSiwsCredentials("mainnet");

      const { client } = yield* createAuthenticatedClient({
        address: credentials.address,
      });

      const png = yield* Effect.promise(() => makePngBuffer());

      const responses = yield* Effect.all([
        updateProfileRequest(client, { displayName: "Satoshi" }),
        getBnsProfileRequest(client),
        uploadImageRequest(client, "avatar", {
          bytes: new Uint8Array(png),
          contentType: "image/png",
        }),
      ]);

      expect({
        statuses: responses.map((response) => response.status),
        storageUploads: recorder.uploads.length,
      }).toStrictEqual({
        statuses: [403, 403, 403],
        storageUploads: 0,
      });
    }).pipe(
      Effect.provide(
        makeTestServerLayer({ STACKS_ENV: "mainnet" }, [], {
          storage: StorageService.layerTest(recorder),
        }),
      ),
    );
  });

  it.effect("GET /api/me/profile/bns reads the profile of the BNS name", () =>
    Effect.gen(function* () {
      const result = yield* getBnsProfile(
        bnsLayer(
          JSON.stringify({
            owner: BNS_OWNER,
            name: "  Satoshi Nakamoto ",
            bio: "Bitcoin",
            // Zonefiles often leave out the protocol.
            website: "bitcoin.org",
            pfp: "https://bitcoin.org/satoshi.png",
            location: "",
            social: [
              { platform: "nostr", username: "npub1" },
              { platform: "X", username: "@satoshi" },
            ],
            subdomains: {},
          }),
        ),
      );

      expect(result).toStrictEqual({
        status: 200,
        body: {
          name: "satoshi.btc",
          profile: {
            displayName: "Satoshi Nakamoto",
            description: "Bitcoin",
            website: "https://bitcoin.org",
            twitter: "satoshi",
            picture: "https://bitcoin.org/satoshi.png",
          },
        },
      });
    }),
  );

  it.effect(
    "GET /api/me/profile/bns skips the fields the profile can't store",
    () =>
      Effect.gen(function* () {
        const result = yield* getBnsProfile(
          bnsLayer(
            JSON.stringify({
              owner: BNS_OWNER,
              name: "Satoshi",
              bio: 42,
              website: "data:text/html,hello",
              pfp: "ftp://bitcoin.org/satoshi.png",
              social: [{ platform: "twitter", username: "not a handle" }],
            }),
          ),
        );

        expect(result).toStrictEqual({
          status: 200,
          body: {
            name: "satoshi.btc",
            profile: {
              displayName: "Satoshi",
              description: null,
              website: null,
              twitter: null,
              picture: null,
            },
          },
        });
      }),
  );

  it.effect(
    "GET /api/me/profile/bns returns no profile for zonefiles it can't import",
    () =>
      Effect.gen(function* () {
        const results = yield* Effect.forEach(
          [
            // Written by a previous owner of the name.
            bnsLayer(
              JSON.stringify({
                owner: createTestSiwsCredentials().address,
                name: "Satoshi",
              }),
            ),
            // Not JSON, such as a compressed or BNS V1 zonefile.
            bnsLayer("$ORIGIN satoshi.btc"),
            // JSON without a profile field.
            bnsLayer(
              JSON.stringify({ owner: BNS_OWNER, name: "", btc: "bc1q" }),
            ),
            // A name without a zonefile.
            BnsService.layerTest({
              [BNS_OWNER]: { fullName: "satoshi.btc", zonefile: null },
            }),
          ],
          getBnsProfile,
        );

        const noName = yield* getBnsProfile(BnsService.layerTest());

        expect({ results, noName }).toStrictEqual({
          results: Array.from({ length: 4 }, () => ({
            status: 200,
            body: { name: "satoshi.btc", profile: null },
          })),
          noName: { status: 200, body: { name: null, profile: null } },
        });
      }),
  );

  it.effect(
    "GET /api/me/profile/bns returns 500 when the Stacks API fails",
    () =>
      Effect.gen(function* () {
        const result = yield* getBnsProfile(
          Layer.succeed(BnsService, {
            findPrimaryName: () =>
              Effect.fail(
                new BnsLookupError({ cause: null, message: "unreachable" }),
              ),
          }),
        );

        expect(result).toStrictEqual({
          status: 500,
          body: { message: "Failed to read your BNS name, please try again." },
        });
      }),
  );

  it.effect("PUT /images/avatar stores a resized webp with metadata", () => {
    const recorder = makeStorageTestRecorder();
    const events: Array<PostHogEvent> = [];

    return Effect.gen(function* () {
      const { client, userId } = yield* createAuthenticatedClient();
      const png = yield* Effect.promise(() => makePngBuffer(1200, 600));

      const response = yield* uploadImageRequest(client, "avatar", {
        bytes: new Uint8Array(png),
        contentType: "image/png",
      });

      const body = yield* HttpClientResponse.schemaBodyJson(
        UploadProfileImageResponse,
      )(response);

      const uploaded = recorder.uploads[0];
      const uploadedBytes = Buffer.from(uploaded?.body ?? new Uint8Array());

      const metadata = yield* Effect.promise(() =>
        sharp(uploadedBytes).metadata(),
      );

      const version = uploaded === undefined ? "" : sha256Hex(uploaded.body);
      const key = `u/${userId}/avatar/${version}.webp`;
      const url = `${STORAGE_TEST_PUBLIC_URL}/${key}`;

      const db = yield* Database;

      const [savedMedia] = yield* db
        .select()
        .from(mediaImage)
        .where(eq(mediaImage.id, url))
        .limit(1)
        .pipe(Effect.orDie);

      expect({
        status: response.status,
        body,
        upload: uploaded,
        width: metadata.width,
        height: metadata.height,
        isWebp: uploadedBytes.subarray(8, 12).toString() === "WEBP",
        mediaStatus: savedMedia?.status,
        mediaMimeType: savedMedia?.mimeType,
        mediaWidth: savedMedia?.width,
        mediaHeight: savedMedia?.height,
        mediaSize: savedMedia?.size,
        thumbhashMatches: body.thumbhash === savedMedia?.thumbhash,
        events,
      }).toStrictEqual({
        status: 200,
        body: {
          height: 300,
          sizeBytes: uploadedBytes.length,
          thumbhash: expect.any(String),
          url,
          width: 600,
        },
        upload: {
          body: uploaded?.body,
          contentType: "image/webp",
          key,
          version,
        },
        width: 600,
        height: 300,
        isWebp: true,
        mediaStatus: "READY",
        mediaMimeType: "image/webp",
        mediaWidth: 600,
        mediaHeight: 300,
        mediaSize: uploadedBytes.length,
        thumbhashMatches: true,
        events: [
          {
            distinctId: userId,
            event: "profile media uploaded",
            properties: {
              key,
              sizeBytes: uploadedBytes.length,
              url,
            },
          },
        ],
      });
    }).pipe(Effect.provide(imageServerLayer(recorder, {}, events)));
  });

  it.effect(
    "PUT /images/cover stores a webp under the cover key and its hash",
    () => {
      const recorder = makeStorageTestRecorder();
      const events: Array<PostHogEvent> = [];

      return Effect.gen(function* () {
        const { client, userId } = yield* createAuthenticatedClient();
        const png = yield* Effect.promise(() => makePngBuffer(100, 50));

        const response = yield* uploadImageRequest(client, "cover", {
          bytes: new Uint8Array(png),
          contentType: "image/jpeg",
        });

        const body = yield* HttpClientResponse.schemaBodyJson(
          UploadProfileImageResponse,
        )(response);

        const uploaded = recorder.uploads[0];
        const uploadedBytes = Buffer.from(uploaded?.body ?? new Uint8Array());

        const metadata = yield* Effect.promise(() =>
          sharp(uploadedBytes).metadata(),
        );

        const version = uploaded === undefined ? "" : sha256Hex(uploaded.body);
        const key = `u/${userId}/cover/${version}.webp`;

        expect({
          status: response.status,
          key: uploaded?.key,
          contentType: uploaded?.contentType,
          width: metadata.width,
          height: metadata.height,
          isWebp: uploadedBytes.subarray(8, 12).toString() === "WEBP",
          url: body.url,
          events,
        }).toStrictEqual({
          status: 200,
          key,
          contentType: "image/webp",
          width: 100,
          height: 50,
          isWebp: true,
          url: `${STORAGE_TEST_PUBLIC_URL}/${key}`,
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
      }).pipe(Effect.provide(imageServerLayer(recorder, {}, events)));
    },
  );

  it.effect(
    "PUT /images/avatar never replaces the object behind an earlier URL",
    () => {
      const recorder = makeStorageTestRecorder();

      return Effect.gen(function* () {
        const { client } = yield* createAuthenticatedClient();
        const first = yield* Effect.promise(() => makePngBuffer(16, 16));
        const other = yield* Effect.promise(() => makePngBuffer(32, 32));

        const upload = (png: Buffer) =>
          uploadImageRequest(client, "avatar", {
            bytes: new Uint8Array(png),
            contentType: "image/png",
          }).pipe(
            Effect.flatMap(
              HttpClientResponse.schemaBodyJson(UploadProfileImageResponse),
            ),
            Effect.map((body) => body.url),
          );

        // An avatar picked and then abandoned, and the first one uploaded
        // again.
        const urls = [
          yield* upload(first),
          yield* upload(other),
          yield* upload(first),
        ];

        const keys = recorder.uploads.map((stored) => stored.key);

        expect({
          urls: urls.map((url) => url.replace(STORAGE_TEST_PUBLIC_URL, "")),
          distinctKeys: new Set(keys).size,
        }).toStrictEqual({
          urls: keys.map((key) => `/${key}`),
          distinctKeys: 2,
        });
        expect(keys[0]).toBe(keys[2]);
      }).pipe(Effect.provide(imageServerLayer(recorder)));
    },
  );

  it.effect("PUT /images/avatar rejects unsupported content types", () =>
    Effect.gen(function* () {
      const { client } = yield* createAuthenticatedClient();

      const response = yield* uploadImageRequest(client, "avatar", {
        bytes: new Uint8Array([1, 2, 3]),
        contentType: "text/plain",
      });

      const body =
        yield* HttpClientResponse.schemaBodyJson(ErrorResponse)(response);

      expect({ status: response.status, message: body.message }).toStrictEqual({
        status: 415,
        message: "Unsupported image format: text/plain",
      });
    }).pipe(Effect.provide(makeTestServerLayer())),
  );

  it.effect("PUT /images applies per-kind size limits", () =>
    Effect.gen(function* () {
      const { client } = yield* createAuthenticatedClient();

      const avatar = yield* uploadImageRequest(client, "avatar", {
        bytes: new Uint8Array(3 * 1024 * 1024),
        contentType: "image/png",
      });

      const cover = yield* uploadImageRequest(client, "cover", {
        bytes: new Uint8Array(6 * 1024 * 1024),
        contentType: "image/png",
      });

      const avatarBody =
        yield* HttpClientResponse.schemaBodyJson(ErrorResponse)(avatar);

      const coverBody =
        yield* HttpClientResponse.schemaBodyJson(ErrorResponse)(cover);

      expect({
        statuses: [avatar.status, cover.status],
        messages: [avatarBody.message, coverBody.message],
      }).toStrictEqual({
        statuses: [413, 413],
        messages: [
          "Image is too large, maximum size is 2 MiB.",
          "Image is too large, maximum size is 5 MiB.",
        ],
      });
    }).pipe(Effect.provide(makeTestServerLayer())),
  );

  it.effect("PUT /images/avatar rejects empty bodies and invalid images", () =>
    Effect.gen(function* () {
      const { client } = yield* createAuthenticatedClient();

      const empty = yield* uploadImageRequest(client, "avatar", {
        bytes: new Uint8Array(),
        contentType: "image/png",
      });

      const invalid = yield* uploadImageRequest(client, "avatar", {
        bytes: new Uint8Array([1, 2, 3]),
        contentType: "image/png",
      });

      const emptyBody =
        yield* HttpClientResponse.schemaBodyJson(ErrorResponse)(empty);

      const invalidBody =
        yield* HttpClientResponse.schemaBodyJson(ErrorResponse)(invalid);

      expect({
        statuses: [empty.status, invalid.status],
        messages: [emptyBody.message, invalidBody.message],
      }).toStrictEqual({
        statuses: [400, 415],
        messages: ["No image provided", "Invalid image file"],
      });
    }).pipe(Effect.provide(makeTestServerLayer())),
  );

  it.effect("PUT /images/avatar rejects formats the bytes do not match", () =>
    Effect.gen(function* () {
      const { client } = yield* createAuthenticatedClient();

      const response = yield* uploadImageRequest(client, "avatar", {
        bytes: new Uint8Array(ONE_PIXEL_GIF),
        contentType: "image/png",
      });

      const body =
        yield* HttpClientResponse.schemaBodyJson(ErrorResponse)(response);

      expect({ status: response.status, message: body.message }).toStrictEqual({
        status: 415,
        message: "Unsupported image format: gif",
      });
    }).pipe(Effect.provide(makeTestServerLayer())),
  );

  it.effect("PUT /images/avatar returns 401 without a session", () =>
    Effect.gen(function* () {
      const client = yield* HttpClient.HttpClient;
      const png = yield* Effect.promise(() => makePngBuffer());

      const response = yield* uploadImageRequest(client, "avatar", {
        bytes: new Uint8Array(png),
        contentType: "image/png",
      });

      expect(response.status).toBe(401);
    }).pipe(Effect.provide(makeTestServerLayer())),
  );

  it.effect("PUT /images/avatar returns 500 when storage fails", () => {
    const recorder = makeStorageTestRecorder();

    return Effect.gen(function* () {
      const { client } = yield* createAuthenticatedClient();
      const png = yield* Effect.promise(() => makePngBuffer());

      const response = yield* uploadImageRequest(client, "avatar", {
        bytes: new Uint8Array(png),
        contentType: "image/png",
      });

      const body =
        yield* HttpClientResponse.schemaBodyJson(ErrorResponse)(response);

      expect({ status: response.status, message: body.message }).toStrictEqual({
        status: 500,
        message: "Failed to upload image.",
      });
    }).pipe(
      Effect.provide(
        imageServerLayer(recorder, {
          uploadFile: () =>
            Effect.fail(
              new StorageUploadError({
                cause: new Error("r2 unreachable"),
                message: "r2 unreachable",
              }),
            ),
        }),
      ),
    );
  });

  it.effect("PUT /images/avatar is limited to 4 requests per minute", () => {
    const recorder = makeStorageTestRecorder();

    return Effect.gen(function* () {
      const { client } = yield* createAuthenticatedClient();
      const png = yield* Effect.promise(() => makePngBuffer());

      const responses = yield* Effect.forEach(
        Array.from({ length: 5 }, (_, index) => index),
        () =>
          uploadImageRequest(client, "avatar", {
            bytes: new Uint8Array(png),
            contentType: "image/png",
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
    }).pipe(Effect.provide(imageServerLayer(recorder)));
  });
});
