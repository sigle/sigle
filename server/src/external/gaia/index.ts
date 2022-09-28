/**
 * TODO - this is a temporary solution, on the long term should be exposed by another shared package
 * for both frontend and backend consumption.
 */
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

export interface StoryFile {
  stories: SubsetStory[];
}

export const migrationStories = (
  file?: StoryFile | null | undefined,
): StoryFile => {
  // File do not exist on the storage at all
  if (!file) {
    return { stories: [] };
  }
  return file;
};
