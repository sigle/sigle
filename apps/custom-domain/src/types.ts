export interface SiteSettings {
  url: string;
  username: string;
  address: string;
  name: string;
  description: string;
  avatar: string;
  banner: string;
  links?: { href: string; label: string }[];
  cta?: { href: string; label: string };
}

export interface StoryFile {
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
   * JSON representing the slate.js structure of the story
   */
  content: any;
  /**
   * Version representing the format of the content
   * When the value is not set, we consider it as v1
   * v1: Slate.js JSON
   * v2: TipTap HTML
   */
  contentVersion?: '2';
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
  createdAt: number;
  updatedAt: number;

  /**
   * (Experimental)
   */
  inscriptionId?: string;
  inscriptionNumber?: number;
}

export interface SettingsFile {
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
