export interface BlockstackUser {
  username: string;
}

export interface StoryFile {
  stories: SubsetStory[];
}

export interface Story {
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
   * Content version, used by migration to know the structure of the content
   * If field is not set it means it's the first version
   */
  contentVersion?: '2';
  /**
   * JSON representing the slate.js structure of the story
   */
  content: any;
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
   * Is the story featured. A featured story will be displayed in another way in the list
   * it will also always appear first in the list, no matter the created date
   */
  featured?: boolean;
  createdAt: number;
  updatedAt: number;
}

export interface SubsetStory {
  id: string;
  title: string;
  content: string;
  coverImage?: string;
  type: 'private' | 'public';
  featured?: boolean;
  createdAt: number;
  updatedAt: number;
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
}
