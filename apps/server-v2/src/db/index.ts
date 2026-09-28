import { PgClient } from "@effect/sql-pg";
import { PgliteClient } from "@effect/sql-pglite";
import { PGlite } from "@electric-sql/pglite";
import { sql } from "drizzle-orm";
import * as PgliteDrizzle from "drizzle-orm/effect-pglite";
import { migrate as migratePglite } from "drizzle-orm/effect-pglite/migrator";
import * as PgDrizzle from "drizzle-orm/effect-postgres";
import { migrate as migratePostgres } from "drizzle-orm/effect-postgres/migrator";
import {
  drizzle as drizzleNodePg,
  type NodePgDatabase,
} from "drizzle-orm/node-postgres";
import {
  drizzle as drizzlePglite,
  type PgliteDatabase,
} from "drizzle-orm/pglite";
import { Context, Effect, Layer, Redacted } from "effect";
import { fileURLToPath } from "node:url";
import { AppConfig, type AppConfigValues } from "@/config";
import { relations } from "@/db/relations";
import * as schema from "@/db/schema";

export type DatabaseClient = PgDrizzle.EffectPgDatabase<typeof relations>;

/**
 * Promise-based Drizzle database used by better-auth through
 * `drizzleAdapter`. It shares the underlying connection with the Effect
 * database.
 */
export type AuthDatabaseClient =
  | PgliteDatabase<typeof relations>
  | NodePgDatabase<typeof relations>;

export const drizzleConfig = { schema, relations };

const migrationsFolder = fileURLToPath(
  new URL("../../drizzle", import.meta.url),
);

const POSTGRES_MIGRATION_LOCK_ID = 1_936_287_596;

const makeAuthPgliteDatabase = (client: PGlite) =>
  drizzlePglite({
    client,
    relations,
  });

const makePostgresDatabases = (config: AppConfigValues) =>
  Effect.gen(function* () {
    const db = yield* PgDrizzle.make(drizzleConfig).pipe(
      Effect.provide(PgDrizzle.DefaultServices),
    );

    yield* db.transaction((tx) =>
      Effect.gen(function* () {
        yield* tx.execute(
          sql`select pg_advisory_xact_lock(${POSTGRES_MIGRATION_LOCK_ID})`,
        );

        yield* migratePostgres(tx, { migrationsFolder });
      }),
    );

    const authDb = yield* Effect.acquireRelease(
      Effect.sync(() =>
        drizzleNodePg({
          connection: Redacted.value(config.DATABASE_URL),
          relations,
        }),
      ),
      (instance) => Effect.promise(() => instance.$client.end()),
    );

    return { db, authDb };
  });

export const makePgliteDatabases = Effect.gen(function* () {
  const db = yield* PgliteDrizzle.make(drizzleConfig).pipe(
    Effect.provide(PgliteDrizzle.DefaultServices),
  );

  yield* migratePglite(db, { migrationsFolder });

  const authDb = makeAuthPgliteDatabase(db.$client.pglite as PGlite);

  return { db, authDb };
});

const postgresLayer = (config: AppConfigValues) =>
  Layer.effectContext(
    Effect.map(makePostgresDatabases(config), ({ db, authDb }) =>
      Context.make(Database, db).pipe(Context.add(AuthDatabase, authDb)),
    ),
  ).pipe(Layer.provide(PgClient.layer({ url: config.DATABASE_URL })));

const pgliteLayer = (config: AppConfigValues) =>
  Layer.effectContext(
    Effect.map(makePgliteDatabases, ({ db, authDb }) =>
      Context.make(Database, db).pipe(Context.add(AuthDatabase, authDb)),
    ),
  ).pipe(
    Layer.provide(
      PgliteClient.layer({ dataDir: Redacted.value(config.DATABASE_URL) }),
    ),
  );

export class Database extends Context.Service<Database, DatabaseClient>()(
  "sigle/Database",
) {
  static readonly layer = Layer.unwrap(
    Effect.map(AppConfig, (config) =>
      config.DATABASE_KIND === "postgres"
        ? postgresLayer(config)
        : pgliteLayer(config),
    ),
  );
}

export class AuthDatabase extends Context.Service<
  AuthDatabase,
  AuthDatabaseClient
>()("sigle/AuthDatabase") {}
