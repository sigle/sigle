// TODO shared package for types
interface SubsetStory {
  id: string;
  title: string;
  content: string;
  coverImage?: string;
  type: 'private' | 'public';
  featured?: boolean;
  createdAt: number;
  updatedAt: number;
}

interface StoryFile {
  stories: SubsetStory[];
}

export const migrationStories = (
  file?: StoryFile | null | undefined
): StoryFile => {
  // File do not exist on the storage at all
  if (!file) {
    return { stories: [] };
  }
  return file;
};
