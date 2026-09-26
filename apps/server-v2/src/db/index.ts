import { PgClient } from "@effect/sql-pg";
import { PgliteClient } from "@effect/sql-pglite";
import { sql } from "drizzle-orm";
import * as PgliteDrizzle from "drizzle-orm/effect-pglite";
import { migrate as migratePglite } from "drizzle-orm/effect-pglite/migrator";
import * as PgDrizzle from "drizzle-orm/effect-postgres";
import { migrate as migratePostgres } from "drizzle-orm/effect-postgres/migrator";
import { Context, Effect, Layer, Redacted } from "effect";
import { fileURLToPath } from "node:url";
import { AppConfig, type AppConfigValues } from "@/config";
import { relations } from "@/db/relations";
import * as schema from "@/db/schema";

export type DatabaseClient = PgDrizzle.EffectPgDatabase<typeof relations>;

export const drizzleConfig = { schema, relations };

const migrationsFolder = fileURLToPath(
  new URL("../../drizzle", import.meta.url),
);

const POSTGRES_MIGRATION_LOCK_ID = 1_936_287_596;

const makePostgresDatabase = Effect.gen(function* () {
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

  return db;
});

export const makePgliteDatabase = Effect.gen(function* () {
  const db = yield* PgliteDrizzle.make(drizzleConfig).pipe(
    Effect.provide(PgliteDrizzle.DefaultServices),
  );

  yield* migratePglite(db, { migrationsFolder });

  return db;
});

const postgresLayer = (config: AppConfigValues) =>
  Layer.effect(Database, makePostgresDatabase).pipe(
    Layer.provide(PgClient.layer({ url: config.DATABASE_URL })),
  );

const pgliteLayer = (config: AppConfigValues) =>
  Layer.effect(Database, makePgliteDatabase).pipe(
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
