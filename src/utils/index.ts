import { nanoid } from 'nanoid';
// import { Value } from 'slate';
// import Plain from 'slate-plain-serializer';
import { userSession } from './blockstack';
import { StoryFile, Story, SubsetStory, SettingsFile } from '../types';

const storiesFileName = 'stories.json';
const publicStoriesFileName = 'publicStories.json';
const settingsFileName = 'settings.json';

export const getStoriesFile = async (): Promise<StoryFile> => {
  let file;
  try {
    file = (await userSession.getFile(storiesFileName)) as string;
  } catch (error) {
    if (error.code !== 'does_not_exist') {
      throw error;
    }
  }
  if (file) {
    file = JSON.parse(file);
  }
  if (!file) {
    file = {};
  }
  if (!file.stories) {
    file.stories = [];
  }
  return file;
};

export const saveStoriesFile = async (file: StoryFile): Promise<void> => {
  await userSession.putFile(storiesFileName, JSON.stringify(file));
  const publickStoriesFile = {
    stories: file.stories.filter((s) => s.type === 'public'),
  };
  await userSession.putFile(
    publicStoriesFileName,
    JSON.stringify(publickStoriesFile),
    {
      encrypt: false,
      // It's safe to use this flag here as the public index is built from the private index
      // If the private index is outdated the code will throw an error when we write the storiesFileName
      // before this call.
      dangerouslyIgnoreEtag: true,
    }
  );
};

export const getStoryFile = async (storyId: string): Promise<Story | null> => {
  let originalFile;
  try {
    originalFile = (await userSession.getFile(`${storyId}.json`, {
      decrypt: false,
    })) as string;
  } catch (error) {
    if (error.code !== 'does_not_exist') {
      throw error;
    }
  }
  let file;
  if (originalFile) {
    file = JSON.parse(originalFile);
  }
  if (originalFile && file.mac) {
    file = JSON.parse(
      (await userSession.decryptContent(originalFile)) as string
    );
  }
  return file;
};

export const saveStoryFile = async (file: Story): Promise<void> => {
  await userSession.putFile(`${file.id}.json`, JSON.stringify(file), {
    encrypt: file.type === 'private',
  });
};

export const deleteStoryFile = async (file: Story): Promise<void> => {
  await userSession.deleteFile(`${file.id}.json`);
};

export const publishStory = async (storyId: string): Promise<void> => {
  const story = await getStoryFile(storyId);
  if (!story) {
    throw new Error('Story not found');
  }

  if (story.type === 'public') {
    throw new Error('Story is already public');
  }
  story.type = 'public';

  const storiesFile = await getStoriesFile();

  const index = storiesFile.stories.findIndex((s) => s.id === story.id);
  if (index === -1) {
    throw new Error('File not found in list');
  }
  storiesFile.stories[index].type = 'public';

  await saveStoriesFile(storiesFile);
  await saveStoryFile(story);
};

export const unPublishStory = async (storyId: string): Promise<void> => {
  const story = await getStoryFile(storyId);
  if (!story) {
    throw new Error('Story not found');
  }

  if (story.type === 'private') {
    throw new Error('Story is already private');
  }
  story.type = 'private';
  // A draft can't be featured
  story.featured = false;

  const storiesFile = await getStoriesFile();
  const index = storiesFile.stories.findIndex((s) => s.id === story.id);
  if (index === -1) {
    throw new Error('File not found in list');
  }
  storiesFile.stories[index].type = 'private';
  // A draft can't be featured
  storiesFile.stories[index].featured = false;

  await saveStoriesFile(storiesFile);
  await saveStoryFile(story);
};

export const generateRandomId = nanoid;

export const createNewEmptyStory = (): Story => {
  const now = Date.now();
  return {
    id: generateRandomId(),
    type: 'private',
    title: '',
    content: undefined,
    createdAt: now,
    updatedAt: now,
  };
};

const CONTENT_SUBSET_SIZE = 300;

export const convertStoryToSubsetStory = (story: Story): SubsetStory => {
  // const plainContent = story.content
  //   ? Plain.serialize(Value.fromJSON(story.content))
  //   : '';

  return {
    id: story.id,
    title: story.title,
    // content:
    //   plainContent.length > CONTENT_SUBSET_SIZE
    //     ? plainContent.substring(0, CONTENT_SUBSET_SIZE) + '...'
    //     : plainContent,
    content: 'TODO',
    coverImage: story.coverImage,
    type: story.type,
    featured: story.featured,
    createdAt: story.createdAt,
    updatedAt: story.updatedAt,
  };
};

export const getSettingsFile = async (): Promise<SettingsFile> => {
  let file;
  try {
    file = (await userSession.getFile(settingsFileName, {
      decrypt: false,
    })) as string;
  } catch (error) {
    if (error.code !== 'does_not_exist') {
      throw error;
    }
  }
  if (file) {
    file = JSON.parse(file);
  }
  if (!file) {
    file = {};
  }
  return file;
};

export const saveSettingsFile = async (
  settings: SettingsFile
): Promise<void> => {
  await userSession.putFile(settingsFileName, JSON.stringify(settings), {
    encrypt: false,
  });
};
