import * as z from "zod";

export const SignatureSchema = z.string().min(1).meta({
  description: "A cryptographic signature of the `content` data.",
});

export const Tagchema = z.string().min(1).max(50).meta({
  description: "An arbitrary tag.",
});
