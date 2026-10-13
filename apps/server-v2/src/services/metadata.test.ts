import { describe, expect, it } from "@effect/vitest";
import { Effect, Schema } from "effect";
import { makeJsonHttpClient } from "@/lib/http";
import {
  InvalidMetadataError,
  MetadataFetchError,
  MetadataService,
  MetadataSignatureError,
  makeMetadataService,
} from "@/services/metadata";
import {
  createSignedTestPostMetadata,
  createSignedTestProfileMetadata,
  createTestSiwsCredentials,
} from "@/test/helpers";

const credentials = createTestSiwsCredentials("testnet");

/** Serializes a fixture the way it would travel over the network. */
const toJson = <T>(value: T): Schema.Json => JSON.parse(JSON.stringify(value));

describe("metadata service", () => {
  it.effect("fetches and verifies signed post metadata", () => {
    const signed = createSignedTestPostMetadata({
      draftId: "draft-1",
      privateKey: credentials.privateKey,
    });

    const urls: Array<string> = [];

    const layer = MetadataService.layerTest((url) => {
      urls.push(url);

      return toJson(signed);
    });

    return Effect.gen(function* () {
      const metadata = yield* MetadataService;

      const result = yield* metadata.getPostMetadataFromUri("ar://tx-1");

      expect({
        recoveredAddress: result.recoveredAddress,
        signature: result.signature,
        version: result.version,
        id: result.metadata.content.id,
        title: result.metadata.content.title,
        excerpt: result.excerpt,
        metaTitle: result.metaTitle,
        canonicalUri: result.canonicalUri,
        urls,
      }).toStrictEqual({
        recoveredAddress: credentials.address,
        signature: signed.signature,
        version: "1.0.0",
        id: "draft-1",
        title: "Published Title",
        excerpt: "",
        metaTitle: undefined,
        canonicalUri: undefined,
        urls: ["https://turbo-gateway.test/tx-1"],
      });
    }).pipe(Effect.provide(layer));
  });

  it.effect("resolves ipfs URIs through the IPFS gateway", () => {
    const signed = createSignedTestPostMetadata({
      draftId: "draft-1",
      privateKey: credentials.privateKey,
    });

    const urls: Array<string> = [];

    const layer = MetadataService.layerTest((url) => {
      urls.push(url);

      return toJson(signed);
    });

    return Effect.gen(function* () {
      const metadata = yield* MetadataService;

      yield* metadata.getPostMetadataFromUri("ipfs://bafy-test");

      expect(urls).toStrictEqual(["https://ipfs.test/bafy-test"]);
    }).pipe(Effect.provide(layer));
  });

  it.effect("fetches and verifies signed profile metadata", () => {
    const signed = createSignedTestProfileMetadata({
      id: "profile-1",
      displayName: "Leo",
      privateKey: credentials.privateKey,
    });

    const layer = MetadataService.layerTest(() => toJson(signed));

    return Effect.gen(function* () {
      const metadata = yield* MetadataService;

      const result = yield* metadata.getProfileMetadataFromUri("ar://tx-2");

      expect({
        recoveredAddress: result.recoveredAddress,
        signature: result.signature,
        displayName: result.metadata.content.displayName,
      }).toStrictEqual({
        recoveredAddress: credentials.address,
        signature: signed.signature,
        displayName: "Leo",
      });
    }).pipe(Effect.provide(layer));
  });

  it.effect("rejects metadata that does not match the schema", () => {
    const layer = MetadataService.layerTest(() => ({ hello: "world" }));

    return Effect.gen(function* () {
      const metadata = yield* MetadataService;

      const error = yield* metadata
        .getPostMetadataFromUri("ar://tx-1")
        .pipe(Effect.flip);

      expect(error).toBeInstanceOf(InvalidMetadataError);
      expect(error.message).toContain("Invalid post metadata");
    }).pipe(Effect.provide(layer));
  });

  it.effect("recovers a different address from tampered post metadata", () => {
    const signed = createSignedTestPostMetadata({
      draftId: "draft-1",
      privateKey: credentials.privateKey,
    });

    const tampered = {
      ...signed,
      content: { ...signed.content, title: "Tampered" },
    };

    const layer = MetadataService.layerTest(() => toJson(tampered));

    return Effect.gen(function* () {
      const metadata = yield* MetadataService;

      const result = yield* metadata.getPostMetadataFromUri("ar://tx-1");

      expect(result.recoveredAddress).not.toBe(credentials.address);
    }).pipe(Effect.provide(layer));
  });

  it.effect("rejects metadata without a signature", () => {
    const signed = createSignedTestPostMetadata({
      draftId: "draft-1",
      privateKey: credentials.privateKey,
    });

    const layer = MetadataService.layerTest(() => {
      const { signature: _signature, ...unsigned } = signed;

      return toJson(unsigned);
    });

    return Effect.gen(function* () {
      const metadata = yield* MetadataService;

      const error = yield* metadata
        .getPostMetadataFromUri("ar://tx-1")
        .pipe(Effect.flip);

      expect(error).toBeInstanceOf(MetadataSignatureError);
    }).pipe(Effect.provide(layer));
  });

  it.effect("wraps HTTP failures in MetadataFetchError", () => {
    const service = makeMetadataService(
      makeJsonHttpClient(() => ({ status: 500, body: { error: "down" } })),
      {
        gateways: {
          arweave: "https://turbo-gateway.test",
          ipfs: "https://ipfs.test",
        },
        network: "testnet",
      },
    );

    return Effect.gen(function* () {
      const error = yield* service
        .getPostMetadataFromUri("ar://tx-1")
        .pipe(Effect.flip);

      expect(error).toBeInstanceOf(MetadataFetchError);
      expect(error.message).toContain("Failed to fetch metadata");
    });
  });
});
