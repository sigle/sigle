import { z } from 'zod';
import { evaluate } from '../utils.js';

export interface GaiaStoryV2 {
  /**
   * Random id also used in the url
   * Have to be unique
   */
  id: string;

  /**
   * Title of the story
   */
  title: string;

  /**
   * HTML content of the story
   */
  content: string;

  /**
   * Version representing the format of the content
   * When the value is not set, we consider it as v1
   * v1: Slate.js JSON
   * v2: TipTap HTML
   */
  contentVersion: '2';

  /**
   * Image used to display the cards
   */
  coverImage?: string;

  /**
   * Type of the story
   * private: encrypted
   * public: unencrypted
   */
  type: 'private' | 'public';

  /**
   * Meta title that will be used for SEO
   */
  metaTitle?: string;

  /**
   * Meta description that will be used for SEO
   */
  metaDescription?: string;

  /**
   * Meta image that will be used for SEO
   */
  metaImage?: string;

  /**
   * Canonical URL that will be used for SEO
   */
  canonicalUrl?: string;

  /**
   * Is the story featured. A featured story will be displayed in another way in the list
   * it will also always appear first in the list, no matter the created date
   */
  featured?: boolean;

  /**
   * Hide the cover image on the public story page.
   * The cover image will be used as a thumbnail and SEO only.
   */
  hideCoverImage?: boolean;

  /**
   * Creation date of the story
   */
  createdAt: number;

  /**
   * Last update date of the story
   */
  updatedAt: number;
}

export const GaiaStoryV2Schema = z.object({
  id: z.string(),
  title: z.string(),
  content: z.string(),
  contentVersion: z.literal('2'),
  coverImage: z.string().optional(),
  type: z.union([z.literal('private'), z.literal('public')]),
  metaTitle: z.string().optional(),
  metaDescription: z.string().optional(),
  metaImage: z.string().optional(),
  canonicalUrl: z.string().optional(),
  featured: z.boolean().optional(),
  hideCoverImage: z.boolean().optional(),
  createdAt: z.number(),
  updatedAt: z.number(),
});

export function createGaiaStoryV2(data: GaiaStoryV2): GaiaStoryV2 {
  return evaluate(GaiaStoryV2Schema.safeParse(data));
}
