import { PgliteClient } from "@effect/sql-pglite";
import { Effect } from "effect";
import { makePgliteDatabases } from "@/db";

/**
 * Boots a PGlite instance, applies all Drizzle migrations and returns a gzipped
 * dump of the migrated data directory.
 */
export const makePgliteTemplateDump = Effect.gen(function* () {
  const client = yield* PgliteClient.PgliteClient;
  yield* makePgliteDatabases;

  return yield* client.dumpDataDir("gzip");
}).pipe(Effect.provide(PgliteClient.layer()), Effect.scoped);
