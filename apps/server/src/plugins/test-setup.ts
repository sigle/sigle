import { definePlugin } from "nitro";
import * as fs from "node:fs";
import * as path from "node:path";

declare global {
  var __testDbCleanup: (() => Promise<void>) | undefined;
  var __testDbReady: Promise<void> | undefined;
  var __testPrisma: unknown | undefined;
}

export default definePlugin(async () => {
  console.log(
    "[test-setup] Plugin loaded, import.meta.test =",
    import.meta.test,
  );
  if (!import.meta.test) return;

  const { PGlite } = await import("@electric-sql/pglite");
  const { PrismaPGlite } = await import("pglite-prisma-adapter");
  const { PrismaClient } = await import("@/__generated__/prisma/client.js");
  const { setPrismaClient } = await import("@/lib/prisma.js");

  const initPromise = (async () => {
    const client = new PGlite();

    const rootDir = process.cwd();
    const migrationsDir = path.join(rootDir, "prisma", "migrations");

    const migrations = fs
      .readdirSync(migrationsDir)
      .filter((dir) => fs.statSync(path.join(migrationsDir, dir)).isDirectory())
      .sort();

    for (const migration of migrations) {
      const sqlPath = path.join(migrationsDir, migration, "migration.sql");
      if (fs.existsSync(sqlPath)) {
        const sql = fs.readFileSync(sqlPath, "utf-8");
        await client.exec(sql);
      }
    }

    const adapter = new PrismaPGlite(client);
    const db = new PrismaClient({ adapter });
    setPrismaClient(db);
    await db.$connect();

    globalThis.__testPrisma = db;
    console.log("[test-setup] PGlite initialized, globalThis.__testPrisma set");

    globalThis.__testDbCleanup = async () => {
      await client.exec(`
        TRUNCATE TABLE
          "post_nft",
          "minter_fixed_price",
          "collectible",
          "post",
          "draft",
          "session",
          "account",
          "profile",
          "media_image",
          "verification",
          "user",
          "RateLimiterFlexible"
        CASCADE
      `);
    };
  })();

  globalThis.__testDbReady = initPromise;
  await initPromise;
  console.log("[test-setup] PGlite ready, globalThis.__testDbReady set");
});
