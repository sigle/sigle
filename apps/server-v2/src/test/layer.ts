import { PgliteClient } from "@effect/sql-pglite";
import { Context, Effect, Layer } from "effect";
import { AuthDatabase, Database, makePgliteDatabases } from "@/db";

export const TestDatabaseLayer = Layer.effectContext(
  Effect.map(makePgliteDatabases, ({ db, authDb }) =>
    Context.make(Database, db).pipe(Context.add(AuthDatabase, authDb)),
  ),
).pipe(Layer.provide(PgliteClient.layer()));
