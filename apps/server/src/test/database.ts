import { PGlite } from "@electric-sql/pglite";
import * as fs from "node:fs";
import * as path from "node:path";
import { PrismaPGlite } from "pglite-prisma-adapter";
import { PrismaClient } from "~/__generated__/prisma/client.js";
import { setPrismaClient } from "../lib/prisma.js";

export interface TestDatabase {
  db: PrismaClient;
  client: PGlite;
  cleanup: () => Promise<void>;
  close: () => Promise<void>;
}

export async function createTestDatabase(): Promise<TestDatabase> {
  const client = new PGlite();

  // Apply migrations from the migrations folder
  const migrationsDir = path.join(
    import.meta.dirname,
    "..",
    "..",
    "prisma",
    "migrations",
  );

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

  return {
    db,
    client,

    async cleanup() {
      // Truncate all tables in dependency order (dependent tables first)
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
    },

    async close() {
      await db.$disconnect();
      await client.close();
    },
  };
}
