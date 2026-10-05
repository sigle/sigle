import { describe, expect, it } from "@effect/vitest";
import { eq } from "drizzle-orm";
import { Effect, Exit, Layer } from "effect";
import sharp from "sharp";
import { thumbHashToRGBA } from "thumbhash";
import { afterEach, vi } from "vitest";
import { AppConfig } from "@/config";
import { Database } from "@/db";
import { mediaImage } from "@/db/schema";
import { ImageProcessingService } from "@/services/image-processing";
import { createTestMediaImage } from "@/test/helpers";
import { TestDatabaseLayer } from "@/test/layer";
import {
  markImageThumbhashFailed,
  processGenerateImageThumbhashJob,
} from "./generate-image-thumbhash";

const testLayer = Layer.mergeAll(
  TestDatabaseLayer,
  AppConfig.layerTest(),
  ImageProcessingService.layer,
);

const makePngBuffer = (width = 40, height = 20) =>
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

const stubFetchResponse = (body: Uint8Array<ArrayBuffer>, status = 200) => {
  const fetchMock = vi.fn(
    async (_input: RequestInfo | URL, _init?: RequestInit) =>
      new Response(body, {
        status,
        headers: { "content-type": "image/png" },
      }),
  );

  vi.stubGlobal("fetch", fetchMock);

  return fetchMock;
};

const findMediaImage = (id: string) =>
  Effect.gen(function* () {
    const db = yield* Database;

    const [row] = yield* db
      .select()
      .from(mediaImage)
      .where(eq(mediaImage.id, id))
      .limit(1)
      .pipe(Effect.orDie);

    return row;
  });

describe("generate image thumbhash job", () => {
  afterEach(() => {
    vi.restoreAllMocks();
    vi.unstubAllGlobals();
  });

  it.effect(
    "resolves the image URL, computes the thumbhash and marks the row READY",
    () =>
      Effect.gen(function* () {
        const png = yield* Effect.promise(() => makePngBuffer(40, 20));
        const fetchMock = stubFetchResponse(new Uint8Array(png));

        yield* createTestMediaImage({
          id: "ipfs://bafy-test",
          mimeType: "image/png",
        });

        yield* processGenerateImageThumbhashJob({
          imageId: "ipfs://bafy-test",
        });

        const row = yield* findMediaImage("ipfs://bafy-test");

        const decoded = thumbHashToRGBA(Buffer.from(row.thumbhash!, "base64"));

        expect({
          status: row.status,
          width: row.width,
          height: row.height,
          mimeType: row.mimeType,
          size: row.size,
          thumbhash: row.thumbhash,
        }).toStrictEqual({
          status: "READY",
          width: 40,
          height: 20,
          mimeType: "image/png",
          size: png.byteLength,
          thumbhash: expect.any(String),
        });

        // ThumbHash stores an approximate aspect ratio.
        expect(decoded.w / decoded.h).toBeGreaterThan(1.5);
        expect(fetchMock).toHaveBeenCalledTimes(1);
        expect(String(fetchMock.mock.calls[0]?.[0])).toBe(
          "https://ipfs.filebase.io/ipfs/bafy-test",
        );
      }).pipe(Effect.provide(testLayer)),
  );

  it.effect("creates the media row when the producer did not", () =>
    Effect.gen(function* () {
      const png = yield* Effect.promise(() => makePngBuffer());
      stubFetchResponse(new Uint8Array(png));

      yield* processGenerateImageThumbhashJob({
        imageId: "https://cdn.test/orphan.png",
      });

      const row = yield* findMediaImage("https://cdn.test/orphan.png");

      expect(row.status).toBe("READY");
    }).pipe(Effect.provide(testLayer)),
  );

  it.effect("short-circuits images that are already READY", () =>
    Effect.gen(function* () {
      const fetchMock = vi.fn(() => {
        throw new Error("fetch should not be called");
      });

      vi.stubGlobal("fetch", fetchMock);

      yield* createTestMediaImage({
        id: "https://cdn.test/avatar.webp?v=1",
        status: "READY",
        thumbhash: "a".repeat(34),
      });

      yield* processGenerateImageThumbhashJob({
        imageId: "https://cdn.test/avatar.webp?v=1",
      });

      expect(fetchMock).not.toHaveBeenCalled();
    }).pipe(Effect.provide(testLayer)),
  );

  it.effect("fails permanently on a missing image and marks it FAILED", () =>
    Effect.gen(function* () {
      stubFetchResponse(new Uint8Array(), 404);

      yield* createTestMediaImage({ id: "https://cdn.test/missing.png" });

      const exit = yield* Effect.exit(
        processGenerateImageThumbhashJob({
          imageId: "https://cdn.test/missing.png",
        }),
      );

      expect(Exit.isFailure(exit)).toBe(true);

      yield* markImageThumbhashFailed({
        imageId: "https://cdn.test/missing.png",
      });

      const row = yield* findMediaImage("https://cdn.test/missing.png");

      expect(row.status).toBe("FAILED");
    }).pipe(Effect.provide(testLayer)),
  );

  it.effect("rejects images larger than the download limit", () =>
    Effect.gen(function* () {
      const fetchMock = vi.fn(
        async (_input: RequestInfo | URL, _init?: RequestInit) =>
          new Response(new Uint8Array(), {
            status: 200,
            headers: { "content-length": String(11 * 1024 * 1024) },
          }),
      );

      vi.stubGlobal("fetch", fetchMock);

      yield* createTestMediaImage({ id: "https://cdn.test/huge.png" });

      const exit = yield* Effect.exit(
        processGenerateImageThumbhashJob({
          imageId: "https://cdn.test/huge.png",
        }),
      );

      expect(Exit.isFailure(exit)).toBe(true);

      const row = yield* findMediaImage("https://cdn.test/huge.png");

      // Terminal failures are marked FAILED by the queue's onFinalFailure.
      expect(row.status).toBe("PENDING");
    }).pipe(Effect.provide(testLayer)),
  );

  it.effect("cancels the reader once the body exceeds the limit", () => {
    const stream = new ReadableStream<Uint8Array<ArrayBuffer>>({
      start(controller) {
        controller.enqueue(new Uint8Array(6 * 1024 * 1024));
        controller.enqueue(new Uint8Array(6 * 1024 * 1024));
        controller.close();
      },
    });

    return Effect.gen(function* () {
      const cancelSpy = vi.spyOn(
        ReadableStreamDefaultReader.prototype,
        "cancel",
      );

      const fetchMock = vi.fn(
        async (_input: RequestInfo | URL, _init?: RequestInit) =>
          new Response(stream, {
            status: 200,
            headers: { "content-type": "image/png" },
          }),
      );

      vi.stubGlobal("fetch", fetchMock);

      yield* createTestMediaImage({ id: "https://cdn.test/stream.png" });

      const exit = yield* Effect.exit(
        processGenerateImageThumbhashJob({
          imageId: "https://cdn.test/stream.png",
        }),
      );

      expect({
        failed: Exit.isFailure(exit),
        canceled: cancelSpy.mock.calls.length > 0,
      }).toStrictEqual({ failed: true, canceled: true });
    }).pipe(Effect.provide(testLayer));
  });

  it.effect("rejects non-https and private image hosts without fetching", () =>
    Effect.gen(function* () {
      const fetchMock = vi.fn(() => {
        throw new Error("fetch should not be called");
      });

      vi.stubGlobal("fetch", fetchMock);

      const rejected = [
        "http://169.254.169.254/latest/meta-data",
        "https://169.254.169.254/latest/meta-data",
        "https://127.0.0.1/private.png",
        "https://10.0.0.8/private.png",
        "https://[::1]/private.png",
        "https://[fd00::1]/private.png",
        "https://[::ffff:127.0.0.1]/private.png",
        "https://localhost/private.png",
        "https://metadata/private.png",
      ];

      for (const imageId of rejected) {
        yield* createTestMediaImage({ id: imageId });

        const exit = yield* Effect.exit(
          processGenerateImageThumbhashJob({ imageId }),
        );

        expect(Exit.isFailure(exit)).toBe(true);
      }

      expect(fetchMock).not.toHaveBeenCalled();
    }).pipe(Effect.provide(testLayer)),
  );

  it.effect("revalidates redirect targets and refuses private ones", () =>
    Effect.gen(function* () {
      const fetchMock = vi.fn(
        async (_input: RequestInfo | URL, _init?: RequestInit) =>
          new Response(null, {
            status: 302,
            headers: { location: "https://127.0.0.1/private.png" },
          }),
      );

      vi.stubGlobal("fetch", fetchMock);

      yield* createTestMediaImage({ id: "https://cdn.test/redirect.png" });

      const exit = yield* Effect.exit(
        processGenerateImageThumbhashJob({
          imageId: "https://cdn.test/redirect.png",
        }),
      );

      expect({
        failed: Exit.isFailure(exit),
        fetches: fetchMock.mock.calls.length,
      }).toStrictEqual({ failed: true, fetches: 1 });
    }).pipe(Effect.provide(testLayer)),
  );

  it.effect("follows a bounded number of public redirects", () =>
    Effect.gen(function* () {
      const png = yield* Effect.promise(() => makePngBuffer());

      const fetchMock = vi.fn(async (input: RequestInfo | URL) => {
        const url = String(input);

        if (url === "https://cdn.test/first.png") {
          return new Response(null, {
            status: 301,
            headers: { location: "/second.png" },
          });
        }

        return new Response(new Uint8Array(png), {
          status: 200,
          headers: { "content-type": "image/png" },
        });
      });

      vi.stubGlobal("fetch", fetchMock);

      yield* createTestMediaImage({ id: "https://cdn.test/first.png" });

      yield* processGenerateImageThumbhashJob({
        imageId: "https://cdn.test/first.png",
      });

      const row = yield* findMediaImage("https://cdn.test/first.png");

      expect({
        status: row.status,
        urls: fetchMock.mock.calls.map((call) => String(call[0])),
      }).toStrictEqual({
        status: "READY",
        urls: ["https://cdn.test/first.png", "https://cdn.test/second.png"],
      });
    }).pipe(Effect.provide(testLayer)),
  );
});
