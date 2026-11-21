import { SqliteClient } from "@effect/sql-sqlite-node";
import { Layer } from "effect";
import { databasesLayer } from "@/db";

/** A fresh, migrated in-memory database for each layer build. */
export const TestDatabaseLayer = databasesLayer.pipe(
  Layer.provideMerge(SqliteClient.layer({ filename: ":memory:" })),
);
