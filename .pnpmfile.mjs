// Database drivers that better-auth's adapters and drizzle-orm declare as
// optional peers. pnpm installs optional peers too, but the server only uses
// SQLite through drizzle (`drizzle-orm/effect-sqlite-node`) and better-auth's
// Drizzle adapter, so nothing loads them.
const unusedOptionalPeers = {
  "better-auth": ["@prisma/client", "prisma", "mongodb", "mysql2", "pg"],
  "@better-auth/prisma-adapter": ["@prisma/client", "prisma"],
  "@better-auth/mongo-adapter": ["mongodb"],
  "drizzle-orm": [
    "@effect/sql-pg",
    "@effect/sql-pglite",
    "@electric-sql/pglite",
    "@types/pg",
    "mysql2",
    "pg",
    "postgres",
  ],
};

// openapi-typescript (used by `pnpm codegen` in packages/sdk) requires the
// TypeScript 6 compiler API, which was removed from the `typescript` package
// in v7. Give it its own TypeScript 6 copy instead of the workspace's v7.
function readPackage(pkg) {
  if (pkg.name === "openapi-typescript") {
    pkg.dependencies = { ...pkg.dependencies, typescript: "6.0.3" };

    if (pkg.peerDependencies) {
      delete pkg.peerDependencies.typescript;
    }

    if (pkg.peerDependenciesMeta) {
      delete pkg.peerDependenciesMeta.typescript;
    }
  }

  const unusedPeers = unusedOptionalPeers[pkg.name] ?? [];

  for (const name of unusedPeers) {
    // Never remove a peer the package actually requires.
    if (pkg.peerDependenciesMeta?.[name]?.optional === true) {
      if (pkg.peerDependencies) {
        delete pkg.peerDependencies[name];
      }

      delete pkg.peerDependenciesMeta[name];
    }
  }

  return pkg;
}

export const hooks = { readPackage };
