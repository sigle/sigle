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
   * Slug used to customize urls
   * Have to be unique
   */
  slug?: string;
  /**
   * Title of the story
   */
  title: string;
  /**
   * JSON representing the slate.js structure of the story
   */
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
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
  createdAt: number;
  updatedAt: number;
}

export interface SubsetStory {
  id: string;
  slug?: string;
  title: string;
  content: string;
  coverImage?: string;
  type: 'private' | 'public';
  createdAt: number;
  updatedAt: number;
}
