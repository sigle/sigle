import { PostMetadataSchema } from "@sigle/sdk";
import { fromZod } from "@/lib/zod-schema";

/**
 * Signed metadata formats are defined in `@sigle/sdk` (and published as JSON
 * schemas), so the zod schemas are reused instead of being mirrored in Effect.
 */
export const PostMetadata = fromZod(PostMetadataSchema, {
  identifier: "PostMetadata",
  description: "The signed post metadata to upload to Arweave.",
});
