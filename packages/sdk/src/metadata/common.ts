import * as z from "zod";
import { POST_METADATA_LIMITS } from "./limits.js";

export const SignatureSchema = z.string().min(1).meta({
  description:
    "Stacks wallet signature over the canonical JSON metadata payload.",
});

export const TagSchema = z.string().min(1).max(POST_METADATA_LIMITS.tag).meta({
  description: "Topic tag.",
});
