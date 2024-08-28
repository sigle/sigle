import { z } from 'zod';
import { evaluate } from '../utils.js';

export interface GaiaSettings {
  /**
   * Custom name for the blog
   */
  siteName?: string;
  /**
   * Custom description for the blog
   */
  siteDescription?: string;
  /**
   * Custom color used
   */
  siteColor?: string;
  /**
   * Custom logo
   */
  siteLogo?: string;
  /**
   * Website link
   */
  siteUrl?: string;
  /**
   * Twitter handle
   */
  siteTwitterHandle?: string;
}

export const GaiaSettingsSchema = z.object({
  siteName: z.string().optional(),
  siteDescription: z.string().optional(),
  siteColor: z.string().optional(),
  siteLogo: z.string().optional(),
  siteUrl: z.string().optional(),
  siteTwitterHandle: z.string().optional(),
});

export function createGaiaSettings(data: GaiaSettings): GaiaSettings {
  return evaluate(GaiaSettingsSchema.safeParse(data));
}
