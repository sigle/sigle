import fs from "node:fs";
import { join } from "node:path";
import * as z from "zod";
import { PostMetadataSchema } from "../src/index.js";

const outputDir = "jsonschemas";

// `profile/1.0.0.json` is no longer generated: profiles are stored in the
// database, and the file is kept for the profiles published on Arweave before.
const schemas = new Map<string, z.ZodSchema<unknown>>([
  ["posts/1.0.0.json", PostMetadataSchema],
]);

for (const [path, Schema] of schemas) {
  const outputFile = join(outputDir, path);

  const jsonSchema = z.toJSONSchema(Schema, {
    target: "draft-2020-12",
  });

  fs.writeFileSync(outputFile, JSON.stringify(jsonSchema, null, 2), "utf8");
}
