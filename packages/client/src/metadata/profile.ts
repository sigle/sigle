import { z } from 'zod';
import { evaluate } from './utils.js';

export interface Profile {
  /**
   * Name of the profile
   */
  name?: string;
  /**
   * Descrition of the profile
   */
  description?: string;
  /**
   * Picture of the profile
   */
  picture?: string;
  /**
   * Website link
   */
  website?: string;
  /**
   * Twitter handle
   */
  twitter?: string;
}

export const ProfileSchema = z.object({
  name: z.string().optional(),
  description: z.string().optional(),
  picture: z.string().url().optional(),
  website: z.string().url().optional(),
  twitter: z
    .string()
    .optional()
    .refine(
      (val) => {
        if (!val) return true;
        if (val.length > 15) return false;
        if (val.length < 4) return false;
        return /^[A-Za-z0-9_]+$/.test(val);
      },
      {
        message: 'Twitter handle is invalid',
      },
    ),
});

export function createProfile(data: Profile): Profile {
  return evaluate(ProfileSchema.safeParse(data));
}
