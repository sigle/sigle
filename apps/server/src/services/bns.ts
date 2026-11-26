import type { ClarityValue } from "@stacks/transactions";
import { Cl, cvToHex, hexToCV } from "@stacks/transactions";
import { Context, Data, Effect, Layer, Option, Schema } from "effect";
import {
  FetchHttpClient,
  HttpClientRequest,
  HttpClientResponse,
} from "effect/http";
import { AppConfig } from "@/config";
import { makeStacksApiClient, STACKS_API_TIMEOUT } from "@/services/stacks-api";

/**
 * Deployer of the BNS V2 contracts (`BNS-V2` and `zonefile-resolver`), see
 * https://docs.stacks.co/learn/network-fundamentals/bitcoin-name-system.
 */
const BNS_V2_DEPLOYERS = {
  mainnet: "SP2QEZ06AGJ3RKJPBV14SY1V5BBFNAW33D96YPGZF",
  testnet: "ST2QEZ06AGJ3RKJPBV14SY1V5BBFNAW33D9SZJQ0M",
} as const;

export interface BnsName {
  /** Fully qualified name, such as `satoshi.btc`. */
  readonly fullName: string;
  /** The zonefile of the name as UTF-8 text, null when it has none. */
  readonly zonefile: string | null;
}

export class BnsLookupError extends Data.TaggedError("BnsLookupError")<{
  readonly cause: unknown;
  readonly message: string;
}> {}

export interface BnsClient {
  /**
   * The primary BNS V2 name of a Stacks address with its zonefile, or null
   * when the address has no primary name.
   */
  readonly findPrimaryName: (
    address: string,
  ) => Effect.Effect<BnsName | null, BnsLookupError>;
}

const ReadOnlyResponse = Schema.Struct({
  okay: Schema.Boolean,
  result: Schema.optionalKey(Schema.String),
  cause: Schema.optionalKey(Schema.String),
});

const BufferCV = Schema.Struct({
  type: Schema.Literal("buffer"),
  value: Schema.String,
});

const NameTupleCV = Schema.Struct({
  type: Schema.Literal("tuple"),
  value: Schema.Struct({ name: BufferCV, namespace: BufferCV }),
});

// `get-primary` returns `(ok (some {name, namespace}))`, and an error such as
// `u131` when the address has no primary name.
const PrimaryNameCV = Schema.Struct({
  type: Schema.Literal("ok"),
  value: Schema.Struct({ type: Schema.Literal("some"), value: NameTupleCV }),
});

// `resolve-name` returns `(ok (some zonefile))`. Its errors all mean there is
// no zonefile to read: none was set (`u101`), or the name doesn't exist, was
// revoked or expired.
const ZonefileCV = Schema.Struct({
  type: Schema.Literal("ok"),
  value: Schema.Struct({ type: Schema.Literal("some"), value: BufferCV }),
});

const decodePrimaryName = Schema.decodeUnknownOption(PrimaryNameCV);

const decodeZonefile = Schema.decodeUnknownOption(ZonefileCV);

const hexToText = (hex: string): string =>
  Buffer.from(hex.replace(/^0x/, ""), "hex").toString("utf8");

export const makeBnsService = Effect.gen(function* () {
  const config = yield* AppConfig;
  const stacksApi = yield* makeStacksApiClient;
  const deployer = BNS_V2_DEPLOYERS[config.STACKS_ENV];

  const callReadOnly = (
    contract: string,
    functionName: string,
    args: ReadonlyArray<ClarityValue>,
  ) =>
    Effect.gen(function* () {
      const response = yield* HttpClientRequest.post(
        `/v2/contracts/call-read/${deployer}/${contract}/${functionName}`,
      ).pipe(
        HttpClientRequest.bodyJsonUnsafe({
          sender: deployer,
          arguments: args.map((arg) => cvToHex(arg)),
        }),
        stacksApi.execute,
        Effect.flatMap(HttpClientResponse.schemaBodyJson(ReadOnlyResponse)),
        Effect.timeout(STACKS_API_TIMEOUT),
        Effect.mapError(
          (cause) =>
            new BnsLookupError({
              cause,
              message: `Stacks API ${contract}.${functionName} call failed: ${cause.message}`,
            }),
        ),
      );

      if (!response.okay || response.result === undefined) {
        return yield* new BnsLookupError({
          cause: response.cause,
          message: `${contract}.${functionName} call failed: ${response.cause ?? "no result"}`,
        });
      }

      return hexToCV(response.result);
    });

  const findPrimaryName = (address: string) =>
    Effect.gen(function* () {
      const primary = decodePrimaryName(
        yield* callReadOnly("BNS-V2", "get-primary", [Cl.principal(address)]),
      );

      if (Option.isNone(primary)) {
        return null;
      }

      const { name, namespace } = primary.value.value.value.value;

      const zonefile = decodeZonefile(
        yield* callReadOnly("zonefile-resolver", "resolve-name", [
          Cl.bufferFromHex(name.value),
          Cl.bufferFromHex(namespace.value),
        ]),
      );

      return {
        fullName: `${hexToText(name.value)}.${hexToText(namespace.value)}`,
        zonefile: Option.match(zonefile, {
          onNone: () => null,
          onSome: (found) => hexToText(found.value.value.value),
        }),
      };
    });

  return { findPrimaryName } satisfies BnsClient;
});

export class BnsService extends Context.Service<BnsService, BnsClient>()(
  "sigle/BnsService",
) {
  static readonly layer: Layer.Layer<BnsService, never, AppConfig> =
    Layer.effect(BnsService, makeBnsService).pipe(
      Layer.provide(FetchHttpClient.layer),
    );

  /** Serves the given primary names, keyed by Stacks address. */
  static readonly layerTest = (
    names: Readonly<Record<string, BnsName>> = {},
  ): Layer.Layer<BnsService> =>
    Layer.succeed(BnsService, {
      findPrimaryName: (address) => Effect.succeed(names[address] ?? null),
    });
}
