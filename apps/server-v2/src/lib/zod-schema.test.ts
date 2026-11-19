import { describe, expect, it } from "@effect/vitest";
import { Effect, Exit, Schema } from "effect";
import {
  HttpApi,
  HttpApiEndpoint,
  HttpApiGroup,
  OpenApi,
} from "effect/http-api";
import * as z from "zod";
import { fromZod } from "@/lib/zod-schema";

const Author = fromZod(
  z.object({
    name: z.string().min(1),
    age: z.number().int().optional(),
  }),
  { identifier: "Author", description: "A post author." },
);

const decodeAuthorJson = Schema.decodeUnknownEffect(
  Schema.fromJsonString(Author),
);

describe(fromZod, () => {
  it.effect("decodes with zod and returns its parsed output", () =>
    Effect.gen(function* () {
      const author = yield* Schema.decodeUnknownEffect(Author)({
        name: "Ada",
        extra: true,
      });

      expect(author).toStrictEqual({ name: "Ada" });
    }),
  );

  it.effect("decodes a JSON string through the JSON codec", () =>
    Effect.gen(function* () {
      const author = yield* decodeAuthorJson('{"name":"Ada","age":36}');

      expect(author).toStrictEqual({ name: "Ada", age: 36 });
    }),
  );

  it.effect("reports the zod issues when decoding fails", () =>
    Effect.gen(function* () {
      const exit = yield* Effect.exit(
        Schema.decodeEffect(Author)({ name: "", age: 1.5 }),
      );

      expect(Exit.isFailure(exit)).toBe(true);

      const message = Exit.isFailure(exit) ? String(exit.cause) : "";

      expect(message).toContain("name");
      expect(message).toContain("age");
    }),
  );

  it("documents the zod JSON schema in OpenAPI", () => {
    const api = HttpApi.make("test").add(
      HttpApiGroup.make("authors").add(
        HttpApiEndpoint.post("create", "/authors", {
          payload: Schema.Struct({ author: Author }),
        }),
      ),
    );

    const spec = OpenApi.fromApi(api);

    expect(spec.components.schemas["Author"]).toStrictEqual({
      type: "object",
      properties: {
        name: { type: "string", minLength: 1 },
        age: {
          type: "integer",
          minimum: Number.MIN_SAFE_INTEGER,
          maximum: Number.MAX_SAFE_INTEGER,
        },
      },
      required: ["name"],
      description: "A post author.",
    });
  });
});
