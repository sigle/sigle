import * as z from "zod";
import { POST_METADATA_LIMITS } from "./limits.js";

export const SignatureSchema = z.string().min(1).meta({
  description: "A cryptographic signature of the `content` data.",
});

export const Tagchema = z.string().min(1).max(POST_METADATA_LIMITS.tag).meta({
  description: "An arbitrary tag.",
});
