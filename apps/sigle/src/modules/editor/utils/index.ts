import { Story, SubsetStory } from '../../../types';
import { getStoriesFile, saveStoriesFile, saveStoryFile } from '../../../utils';

const CONTENT_SUBSET_SIZE = 300;

export const createSubsetStory = (
  story: Story,
  { plainContent }: { plainContent: string },
): SubsetStory => {
  return {
    id: story.id,
    title: story.title,
    content:
      plainContent.length > CONTENT_SUBSET_SIZE
        ? plainContent.substring(0, CONTENT_SUBSET_SIZE) + '...'
        : plainContent,
    coverImage: story.coverImage,
    type: story.type,
    featured: story.featured,
    createdAt: story.createdAt,
    updatedAt: story.updatedAt,
  };
};

export const saveStory = async (
  story: Story,
  subsetStory: SubsetStory,
): Promise<void> => {
  const file = await getStoriesFile();
  const index = file.stories.findIndex((s) => s.id === story.id);
  if (index === -1) {
    throw new Error('File not found in list');
  }
  // First we save the story
  await saveStoryFile(story);
  // Then we need to update the subset story on the index
  file.stories[index] = subsetStory;
  // We sort the files by date in case createdAt was changed
  file.stories.sort((a, b) => b.createdAt - a.createdAt);
  await saveStoriesFile(file);
};
