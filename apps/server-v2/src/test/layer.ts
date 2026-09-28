import { PgliteClient } from "@effect/sql-pglite";
import { Context, Effect, Layer } from "effect";
import { readdir, readFile, stat } from "node:fs/promises";
import { join } from "node:path";
import { fileURLToPath } from "node:url";
import { AuthDatabase, Database, makePgliteDatabases } from "@/db";
import { makePgliteTemplateDump } from "@/test/pglite-template";

const migrationsFolder = fileURLToPath(
  new URL("../../drizzle", import.meta.url),
);
const templatePath = fileURLToPath(
  new URL("../../.vitest/pglite-template.tar.gz", import.meta.url),
);

/**
 * Reads the template written by the global setup, unless it is older than the
 * newest migration. Vitest runs the global setup once per process, so a stale
 * template can happen when migrations change during a watch session.
 */
const loadTemplateFromDisk = Effect.promise(async () => {
  const entries = await readdir(migrationsFolder, { withFileTypes: true });

  const [template, migrationMtimes] = await Promise.all([
    stat(templatePath).catch(() => undefined),
    Promise.all(
      entries.map((entry) =>
        stat(join(migrationsFolder, entry.name, "migration.sql")).catch(
          () => undefined,
        ),
      ),
    ),
  ]);

  const newestMigration = Math.max(
    0,
    ...migrationMtimes.map((migration) => migration?.mtimeMs ?? 0),
  );

  if (template === undefined || template.mtimeMs < newestMigration) {
    return undefined;
  }

  const bytes = await readFile(templatePath);
  return new File([bytes], "pglite-template.tar.gz");
});

const loadTemplate = Effect.runSync(
  Effect.cached(
    Effect.gen(function* () {
      return (yield* loadTemplateFromDisk) ?? (yield* makePgliteTemplateDump);
    }),
  ),
);

const databaseContext = Layer.effectContext(
  Effect.map(makePgliteDatabases, ({ db, authDb }) =>
    Context.make(Database, db).pipe(Context.add(AuthDatabase, authDb)),
  ),
);

export const TestDatabaseLayer = Layer.unwrap(
  Effect.map(loadTemplate, (loadDataDir) =>
    databaseContext.pipe(Layer.provide(PgliteClient.layer({ loadDataDir }))),
  ),
);
