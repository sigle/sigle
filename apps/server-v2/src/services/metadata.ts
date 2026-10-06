import {
  type MetadataAttribute,
  type PostMetadata,
  PostMetadataSchema,
  type ProfileMetadata,
  ProfileMetadataSchema,
  verifyMetadataSignature,
} from "@sigle/sdk";
import { Context, Data, Effect, Layer, Schema } from "effect";
import { AppConfig } from "@/config";
import { type ImageGateways, resolveImageUrl } from "@/lib/images";

export class MetadataFetchError extends Data.TaggedError("MetadataFetchError")<{
  readonly message: string;
  readonly cause: unknown;
}> {}

export class InvalidMetadataError extends Data.TaggedError(
  "InvalidMetadataError",
)<{
  readonly message: string;
}> {}

export class MetadataSignatureError extends Data.TaggedError(
  "MetadataSignatureError",
)<{
  readonly message: string;
  readonly cause: unknown;
}> {}

export type MetadataError =
  | MetadataFetchError
  | InvalidMetadataError
  | MetadataSignatureError;

export interface MetadataHttpClient {
  readonly fetchJson: (
    url: string,
  ) => Effect.Effect<Schema.Json, MetadataFetchError>;
}

const describeCause = (cause: unknown): string =>
  cause instanceof Error ? cause.message : String(cause);

/**
 * Fetches a JSON document over `fetch`. The payload is decoded at this
 * boundary so callers never handle raw JSON.
 */
export const makeFetchMetadataHttpClient = (): MetadataHttpClient => ({
  fetchJson: (url) =>
    Effect.gen(function* () {
      const response = yield* Effect.tryPromise({
        try: () => fetch(url),
        catch: (cause) =>
          new MetadataFetchError({
            message: `Failed to fetch metadata from ${url}: ${describeCause(cause)}`,
            cause,
          }),
      });

      if (!response.ok) {
        return yield* new MetadataFetchError({
          message: `Failed to fetch metadata from ${url}: status ${response.status}`,
          cause: undefined,
        });
      }

      const json = yield* Effect.tryPromise({
        try: () => response.json(),
        catch: (cause) =>
          new MetadataFetchError({
            message: `Failed to read metadata from ${url}: ${describeCause(cause)}`,
            cause,
          }),
      });

      return yield* Schema.decodeUnknownEffect(Schema.Json)(json).pipe(
        Effect.mapError(
          (cause) =>
            new MetadataFetchError({
              message: `Metadata at ${url} is not valid JSON`,
              cause,
            }),
        ),
      );
    }),
});

export interface VerifiedPostMetadata {
  readonly metadata: PostMetadata;
  readonly recoveredAddress: string;
  readonly signature: string;
  /** Schema version extracted from `$schema`, e.g. `1.0.0`. */
  readonly version: string;
  readonly metaTitle: string | undefined;
  readonly metaDescription: string | undefined;
  readonly excerpt: string;
  readonly canonicalUri: string | undefined;
}

export interface VerifiedProfileMetadata {
  readonly metadata: ProfileMetadata;
  readonly recoveredAddress: string;
  readonly signature: string;
}

export interface MetadataServiceOptions {
  readonly gateways: ImageGateways;
  readonly network: "mainnet" | "testnet";
}

export interface MetadataOperations {
  /**
   * Fetches, validates and verifies the signature of post metadata stored at
   * an `ar://` or `ipfs://` URI, returning the parsed metadata fields.
   */
  readonly getPostMetadataFromUri: (
    uri: string,
  ) => Effect.Effect<VerifiedPostMetadata, MetadataError>;
  /**
   * Fetches, validates and verifies the signature of profile metadata stored
   * at an `ar://` or `ipfs://` URI.
   */
  readonly getProfileMetadataFromUri: (
    uri: string,
  ) => Effect.Effect<VerifiedProfileMetadata, MetadataError>;
}

const schemaVersion = (schema: string): string => {
  const segments = schema.split("/");
  const last = segments[segments.length - 1] ?? "";

  return last.replace(/\.json$/, "");
};

const findAttributeValue = (
  attributes: ReadonlyArray<MetadataAttribute> | undefined,
  key: string,
): string | undefined =>
  attributes?.find((attribute) => attribute.key === key)?.value;

export const makeMetadataService = (
  http: MetadataHttpClient,
  options: MetadataServiceOptions,
): MetadataOperations => {
  const fetchJson = (uri: string) =>
    http.fetchJson(resolveImageUrl(uri, options.gateways));

  return {
    getPostMetadataFromUri: (uri) =>
      Effect.gen(function* () {
        const json = yield* fetchJson(uri);

        const parsed = PostMetadataSchema.safeParse(json);

        if (!parsed.success) {
          return yield* new InvalidMetadataError({
            message: `Invalid post metadata: ${parsed.error.issues.length} validation error(s)`,
          });
        }

        const metadata = parsed.data;

        const signatureResult = verifyMetadataSignature(metadata, {
          network: options.network,
        });

        if (signatureResult.isErr()) {
          return yield* new MetadataSignatureError({
            message: signatureResult.error.error,
            cause: signatureResult.error,
          });
        }

        const { recoveredAddress, signature } = signatureResult.value;
        const attributes = metadata.content.attributes;

        return {
          metadata,
          recoveredAddress,
          signature,
          version: schemaVersion(metadata.$schema),
          metaTitle: findAttributeValue(attributes, "meta-title"),
          metaDescription: findAttributeValue(attributes, "meta-description"),
          excerpt: findAttributeValue(attributes, "excerpt") ?? "",
          canonicalUri: findAttributeValue(attributes, "canonical-uri"),
        };
      }),
    getProfileMetadataFromUri: (uri) =>
      Effect.gen(function* () {
        const json = yield* fetchJson(uri);

        const parsed = ProfileMetadataSchema.safeParse(json);

        if (!parsed.success) {
          return yield* new InvalidMetadataError({
            message: `Invalid profile metadata: ${parsed.error.issues.length} validation error(s)`,
          });
        }

        const signatureResult = verifyMetadataSignature(parsed.data, {
          network: options.network,
        });

        if (signatureResult.isErr()) {
          return yield* new MetadataSignatureError({
            message: signatureResult.error.error,
            cause: signatureResult.error,
          });
        }

        const { recoveredAddress, signature } = signatureResult.value;

        return {
          metadata: parsed.data,
          recoveredAddress,
          signature,
        };
      }),
  };
};

const TEST_GATEWAYS: ImageGateways = {
  arweave: "https://turbo-gateway.test",
  ipfs: "https://ipfs.test",
};

export class MetadataService extends Context.Service<
  MetadataService,
  MetadataOperations
>()("sigle/MetadataService") {
  static readonly layer: Layer.Layer<MetadataService, never, AppConfig> =
    Layer.effect(
      MetadataService,
      Effect.gen(function* () {
        const config = yield* AppConfig;

        return makeMetadataService(makeFetchMetadataHttpClient(), {
          gateways: {
            arweave: config.ARWEAVE_GATEWAY_URL,
            ipfs: config.IPFS_GATEWAY_URL,
          },
          network: config.STACKS_ENV,
        });
      }),
    );

  static readonly layerTest = (
    respond: (url: string) => Schema.Json,
    options?: Partial<MetadataServiceOptions> | undefined,
  ): Layer.Layer<MetadataService> =>
    Layer.succeed(
      MetadataService,
      makeMetadataService(
        { fetchJson: (url) => Effect.sync(() => respond(url)) },
        {
          gateways: TEST_GATEWAYS,
          network: "testnet",
          ...options,
        },
      ),
    );
}
