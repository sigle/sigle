import { PgliteClient } from "@effect/sql-pglite";
import { Layer } from "effect";
import { Database, makePgliteDatabase } from "@/db";

export const TestDatabaseLayer = Layer.effect(
  Database,
  makePgliteDatabase,
).pipe(Layer.provide(PgliteClient.layer()));
