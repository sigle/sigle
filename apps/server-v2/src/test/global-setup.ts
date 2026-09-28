import { Effect } from "effect";
import { mkdir, writeFile } from "node:fs/promises";
import { dirname } from "node:path";
import { fileURLToPath } from "node:url";
import { makePgliteTemplateDump } from "@/test/pglite-template";

const templatePath = fileURLToPath(
  new URL("../../.vitest/pglite-template.tar.gz", import.meta.url),
);

/**
 * Builds the migrated PGlite template once per test run. Tests load it through
 * `loadDataDir`, which skips PGlite's WASM `initdb` and the migrations on every
 * database layer build.
 */
export default async function setup() {
  const dump = await Effect.runPromise(makePgliteTemplateDump);

  await mkdir(dirname(templatePath), { recursive: true });
  await writeFile(templatePath, Buffer.from(await dump.arrayBuffer()));
}
