import { describe, expect, it } from "@effect/vitest";
import { Cl, type ClarityValue, cvToHex } from "@stacks/transactions";
import { Effect, Layer } from "effect";
import { HttpClient, HttpClientResponse } from "effect/http";
import { AppConfig } from "@/config";
import { BnsService, makeBnsService } from "@/services/bns";

const ADDRESS = "ST1PQHQKV0RJXZFY1DGX8MNSNYVE3VGZJSRTPGZGM";

const ZONEFILE = '{"owner":"ST1PQHQKV0RJXZFY1DGX8MNSNYVE3VGZJSRTPGZGM"}';

/**
 * Stacks API answering each read-only function with its result, and
 * recording the called URLs.
 */
const makeStacksApiLayer = (
  results: Readonly<Record<string, ClarityValue>>,
  urls: Array<string>,
) =>
  Layer.succeed(
    HttpClient.HttpClient,
    HttpClient.make((request, url) =>
      Effect.sync(() => {
        urls.push(url.toString());

        const functionName = url.pathname.split("/").at(-1) ?? "";
        const result = results[functionName];

        return HttpClientResponse.fromWeb(
          request,
          Response.json(
            result === undefined
              ? { okay: false, cause: "unknown function" }
              : { okay: true, result: cvToHex(result) },
          ),
        );
      }),
    ),
  );

const findPrimaryName = (results: Readonly<Record<string, ClarityValue>>) => {
  const urls: Array<string> = [];

  return Effect.gen(function* () {
    const bns = yield* BnsService;

    return { name: yield* bns.findPrimaryName(ADDRESS), urls };
  }).pipe(
    Effect.provide(
      Layer.effect(BnsService, makeBnsService).pipe(
        Layer.provide(makeStacksApiLayer(results, urls)),
        Layer.provide(
          AppConfig.layerTest({ STACKS_API_URL: "https://stacks.test/" }),
        ),
      ),
    ),
  );
};

const primaryName = Cl.ok(
  Cl.some(
    Cl.tuple({
      name: Cl.bufferFromUtf8("satoshi"),
      namespace: Cl.bufferFromUtf8("btc"),
    }),
  ),
);

describe("bns service", () => {
  it.effect("reads the primary name and its zonefile", () =>
    Effect.gen(function* () {
      const result = yield* findPrimaryName({
        "get-primary": primaryName,
        "resolve-name": Cl.ok(Cl.some(Cl.bufferFromUtf8(ZONEFILE))),
      });

      expect(result).toStrictEqual({
        name: { fullName: "satoshi.btc", zonefile: ZONEFILE },
        urls: [
          "https://stacks.test/v2/contracts/call-read/ST2QEZ06AGJ3RKJPBV14SY1V5BBFNAW33D9SZJQ0M/BNS-V2/get-primary",
          "https://stacks.test/v2/contracts/call-read/ST2QEZ06AGJ3RKJPBV14SY1V5BBFNAW33D9SZJQ0M/zonefile-resolver/resolve-name",
        ],
      });
    }),
  );

  it.effect("returns a name without a zonefile", () =>
    Effect.gen(function* () {
      // ERR-NO-ZONEFILE-FOUND
      const result = yield* findPrimaryName({
        "get-primary": primaryName,
        "resolve-name": Cl.error(Cl.uint(101)),
      });

      expect(result.name).toStrictEqual({
        fullName: "satoshi.btc",
        zonefile: null,
      });
    }),
  );

  it.effect("returns null for an address without a primary name", () =>
    Effect.gen(function* () {
      const result = yield* findPrimaryName({
        "get-primary": Cl.error(Cl.uint(131)),
      });

      expect(result).toStrictEqual({
        name: null,
        urls: [
          "https://stacks.test/v2/contracts/call-read/ST2QEZ06AGJ3RKJPBV14SY1V5BBFNAW33D9SZJQ0M/BNS-V2/get-primary",
        ],
      });
    }),
  );

  it.effect("fails when the contract call fails", () =>
    Effect.gen(function* () {
      const error = yield* findPrimaryName({}).pipe(Effect.flip);

      expect({ tag: error._tag, message: error.message }).toStrictEqual({
        tag: "BnsLookupError",
        message: "BNS-V2.get-primary call failed: unknown function",
      });
    }),
  );
});
