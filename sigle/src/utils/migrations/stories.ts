import { StoryFile } from '../../types';

export const migrationStories = (
  file?: StoryFile | null | undefined,
): StoryFile => {
  // File do not exist on the storage at all
  if (!file) {
    return { stories: [] };
  }
  return file;
};
