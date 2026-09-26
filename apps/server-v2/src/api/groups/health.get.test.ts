import { describe, expect, it } from "@effect/vitest";
import { Effect } from "effect";
import { getHealth } from "@/api/handlers/health";

describe("health.get", () => {
  it.effect("returns success true", () =>
    Effect.gen(function* () {
      const result = yield* getHealth();

      expect(result).toStrictEqual({ success: true });
    }),
  );
});
