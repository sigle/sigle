import fs from "node:fs";
import { join } from "node:path";
import * as z from "zod";
import { PostMetadataSchema, SchemasRoot } from "../src/index.js";

const outputDir = "jsonschemas";

// `profile/1.0.0.json` is no longer generated: profiles are stored in the
// database, and the file is kept for the profiles published on Arweave before.
const schemas = new Map<string, z.ZodSchema<unknown>>([
  ["posts/1.0.0.json", PostMetadataSchema],
]);

for (const [path, Schema] of schemas) {
  const outputFile = join(outputDir, path);

  const { $schema, ...jsonSchema } = z.toJSONSchema(Schema, {
    target: "draft-2020-12",
  });

  // The docs site serves the schemas from `SchemasRoot`, see
  // `apps/docs/src/pages/schemas/[...path].ts`.
  fs.writeFileSync(
    outputFile,
    `${JSON.stringify({ $schema, $id: `${SchemasRoot}/${path}`, ...jsonSchema }, null, 2)}\n`,
    "utf8",
  );
}
