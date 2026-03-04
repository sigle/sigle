import { z } from "zod";
import { ProfileMetadataSchemaId } from "./config.js";
import {
  MetadataAttributeSchema,
  type MetadataAttribute,
} from "./metadata-attribute.js";
import { evaluate } from "./utils.js";

export interface ProfileMetadata {
  /**
   * Random id also used in the url
   * Have to be unique on sigle
   */
  id: string;
  /**
   * The profile display name.
   */
  displayName?: string;
  /**
   * The profile description as Markdown.
   */
  description?: string;
  /**
   * The website URL.
   */
  website?: string;
  /**
   * Twitter username.
   */
  twitter?: string;
  /**
   * The profile image URL.
   */
  picture?: string;
  /**
   * The profile cover image URL.
   */
  coverPicture?: string;

  /**
   * List of attributes that can be used to store any additional information that is not supported by the standard.
   */
  attributes?: MetadataAttribute[];
}

export const ProfileMetadataSchema = z.object({
  $schema: z.literal(ProfileMetadataSchemaId.LATEST),
  id: z.string().min(1).meta({
    description: "Random id also used in the url. Have to be unique on sigle.",
  }),
  displayName: z.string().min(1).max(100).optional().meta({
    description: "The profile display name.",
  }),
  description: z.string().min(1).optional().meta({
    description: "The profile description as Markdown.",
  }),
  website: z.url().optional().meta({
    description: "The website URL.",
  }),
  twitter: z
    .string()
    .min(1)
    .regex(
      /^[A-Za-z0-9_]*$/,
      "Twitter handle can only contain letters, numbers and underscore",
    )
    .optional()
    .meta({
      description: "Twitter username.",
    }),
  picture: z.url().optional().meta({
    description: "The profile image URL.",
  }),
  coverPicture: z.url().optional().meta({
    description: "The profile cover image URL.",
  }),
  attributes: MetadataAttributeSchema.array().min(1).max(20).optional().meta({
    description:
      "List of attributes that can be used to store any additional information that is not supported by the standard",
  }),
});

export function createProfileMetadata(data: ProfileMetadata): ProfileMetadata {
  return evaluate(ProfileMetadataSchema.safeParse(data));
}
