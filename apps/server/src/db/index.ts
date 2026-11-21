import { SqliteClient } from "@effect/sql-sqlite-node";
import * as SqliteDrizzle from "drizzle-orm/effect-sqlite-node";
import { migrate } from "drizzle-orm/effect-sqlite-node/migrator";
import {
  drizzle as drizzleProxy,
  type SqliteProxyExecutors,
  type SqliteRemoteDatabase,
} from "drizzle-orm/sqlite-proxy";
import { Context, Effect, Layer } from "effect";
import { SqlClient, type SqlError } from "effect/sql";
import { findPackageJSON } from "node:module";
import { dirname, join } from "node:path";
import { AppConfig } from "@/config";
import { relations } from "@/db/relations";
import * as schema from "@/db/schema";

/** Effect Drizzle database on Node's built-in SQLite (`node:sqlite`). */
export type DatabaseClient = SqliteDrizzle.EffectSQLiteNodeDatabase<
  typeof relations
>;

/**
 * Promise-based Drizzle database used by better-auth through
 * `drizzleAdapter`. Its queries run on the Effect database's connection, see
 * `makeAuthDatabase`.
 */
export type AuthDatabaseClient = SqliteRemoteDatabase<
  unknown,
  typeof relations
>;

export const drizzleConfig = { schema, relations };

// Resolved from the package root rather than this file, which moves to
// `dist/main.mjs` once the server is bundled.
const packageJsonPath = findPackageJSON(import.meta.url);

if (packageJsonPath === undefined) {
  throw new Error("server package.json not found");
}

const migrationsFolder = join(dirname(packageJsonPath), "drizzle");

/**
 * Runs better-auth's queries through the Effect SQL client rather than a
 * second connection. The client serializes every query on its one
 * connection, so an auth query waits for an open Effect transaction instead
 * of interleaving with it. A second connection would instead block the event
 * loop on SQLite's busy wait while the transaction holding the write lock
 * could not progress. The drizzle adapter only opens transactions when
 * configured with `transaction: true`, which `createAuth` does not.
 */
const makeAuthDatabase = Effect.gen(function* () {
  const sql = (yield* SqlClient.SqlClient).withoutTransforms();
  const context = yield* Effect.context<never>();

  const run = <A>(effect: Effect.Effect<A, SqlError.SqlError>) =>
    Effect.runPromiseWith(context)(effect);

  const rows = (
    query: string,
    params: ReadonlyArray<unknown>,
    rowMode: "array" | "object" | undefined,
  ) =>
    run(
      rowMode === "object"
        ? sql.unsafe(query, params)
        : sql.unsafe(query, params).values,
    );

  // SAFETY: `rows` returns objects when drizzle asks for `object` rows and
  // value arrays otherwise, the shapes the overloads of each executor return.
  const executors = {
    get: (query, params, rowMode) =>
      rows(query, params, rowMode).then((found) => found[0]),
    all: (query, params, rowMode) => rows(query, params, rowMode),
    run: (query, params) => run(sql.unsafe(query, params).raw),
  } as SqliteProxyExecutors;

  return drizzleProxy(
    executors,
    // The proxy driver has no codecs of its own. The rows come from the same
    // `node:sqlite` connection as the Effect database's, so they decode the
    // same way: timestamps to `Date`, booleans, JSON arrays and blobs.
    { relations, codecs: SqliteDrizzle.effectSQLiteNodeCodecs },
  ) satisfies AuthDatabaseClient;
});

/**
 * Migrates the database and builds both Drizzle clients on the `SqlClient`
 * in context.
 */
export const makeDatabases = Effect.gen(function* () {
  const db = yield* SqliteDrizzle.make(drizzleConfig).pipe(
    Effect.provide(SqliteDrizzle.DefaultServices),
  );

  yield* migrate(db, { migrationsFolder });

  // Both settings apply to the connection. The client has a single
  // connection, so they hold for every later query.
  const sql = yield* SqlClient.SqlClient;
  // SQLite enforces foreign keys (and their cascades) only when enabled.
  yield* sql`PRAGMA foreign_keys = ON`;
  // In WAL mode, NORMAL flushes to disk at checkpoints rather than on every
  // commit, which would block the event loop (`node:sqlite` is synchronous).
  // The database cannot be corrupted: a power loss or host crash can only
  // roll back the last commits, which Litestream may already have uploaded.
  // It then detects the database behind its replica and carries on.
  yield* sql`PRAGMA synchronous = NORMAL`;

  const authDb = yield* makeAuthDatabase;

  return { db, authDb };
});

/** The databases on the SQLite client in context, migrated. */
export const databasesLayer: Layer.Layer<
  Database | AuthDatabase,
  unknown,
  SqliteClient.SqliteClient | SqlClient.SqlClient
> = Layer.effectContext(
  Effect.map(makeDatabases, ({ db, authDb }) =>
    Context.make(Database, db).pipe(Context.add(AuthDatabase, authDb)),
  ),
);

export class Database extends Context.Service<Database, DatabaseClient>()(
  "sigle/Database",
) {
  // The drizzle Effect drivers type their failures as `any`, so the error
  // channel is `unknown`.
  static readonly layer: Layer.Layer<
    Database | AuthDatabase | SqlClient.SqlClient,
    unknown,
    AppConfig
  > = Layer.unwrap(
    Effect.map(AppConfig, (config) =>
      databasesLayer.pipe(
        Layer.provideMerge(
          SqliteClient.layer({ filename: config.DATABASE_PATH }),
        ),
      ),
    ),
  );
}

export class AuthDatabase extends Context.Service<
  AuthDatabase,
  AuthDatabaseClient
>()("sigle/AuthDatabase") {}
