import fs from "node:fs";
import { join } from "node:path";
import * as z from "zod";
import { PostMetadataSchema, ProfileMetadataSchema } from "../src/index.js";

const outputDir = "jsonschemas";

const schemas = new Map<string, z.ZodSchema<unknown>>([
  ["posts/1.0.0.json", PostMetadataSchema],
  ["profile/1.0.0.json", ProfileMetadataSchema],
]);

for (const [path, Schema] of schemas) {
  const outputFile = join(outputDir, path);

  const jsonSchema = z.toJSONSchema(Schema, {
    target: "draft-2020-12",
  });

  fs.writeFileSync(outputFile, JSON.stringify(jsonSchema, null, 2), "utf-8");
}
