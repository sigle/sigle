import { z } from 'zod';
import { evaluate } from './utils.js';

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
}

export const ProfileMetadataSchema = z.object({
  id: z.string().min(1),
  displayName: z.string().min(1).max(100).optional(),
  description: z.string().min(1).optional(),
  website: z.string().url().optional(),
  twitter: z
    .string()
    .min(1)
    .regex(
      /^[A-Za-z0-9_]*$/,
      'Twitter handle can only contain letters, numbers and underscore',
    )
    .optional(),
  picture: z.string().url().optional(),
  coverPicture: z.string().url().optional(),
});

export function createProfileMetadata(data: ProfileMetadata): ProfileMetadata {
  return evaluate(ProfileMetadataSchema.safeParse(data));
}
