import { nanoid } from 'nanoid';
import { StoryFile, Story, SettingsFile } from '../types';
import { userSession, storage } from './stacks';

const storiesFileName = 'stories.json';
const publicStoriesFileName = 'publicStories.json';
const settingsFileName = 'settings.json';

export const getStoriesFile = async (): Promise<StoryFile> => {
  let file;
  try {
    file = await storage.getFile(storiesFileName);
  } catch (error) {
    if (error.code !== 'does_not_exist') {
      throw error;
    }
  }
  if (file) {
    if (file instanceof ArrayBuffer) {
      file = new TextDecoder().decode(file);
    }
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
  await storage.putFile(storiesFileName, JSON.stringify(file));
  const publickStoriesFile = {
    stories: file.stories.filter((s) => s.type === 'public'),
  };
  await storage.putFile(
    publicStoriesFileName,
    JSON.stringify(publickStoriesFile),
    {
      encrypt: false,
      // It's safe to use this flag here as the public index is built from the private index
      // If the private index is outdated the code will throw an error when we write the storiesFileName
      // before this call.
      dangerouslyIgnoreEtag: true,
    },
  );
};

export const getStoryFile = async (storyId: string): Promise<Story | null> => {
  let originalFile;
  try {
    originalFile = await storage.getFile(`${storyId}.json`, {
      decrypt: false,
    });
  } catch (error) {
    if (error.code !== 'does_not_exist') {
      throw error;
    }
  }
  let file;
  if (originalFile) {
    if (originalFile instanceof ArrayBuffer) {
      originalFile = new TextDecoder().decode(originalFile);
    }
    file = JSON.parse(originalFile);
  }
  if (originalFile && file.mac) {
    file = JSON.parse(
      (await userSession.decryptContent(originalFile)) as string,
    );
  }
  return file;
};

export const saveStoryFile = async (file: Story): Promise<void> => {
  await storage.putFile(`${file.id}.json`, JSON.stringify(file), {
    encrypt: file.type === 'private',
  });
};

export const deleteStoryFile = async (storyId: string): Promise<void> => {
  await storage.deleteFile(`${storyId}.json`);
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
    content: '',
    createdAt: now,
    updatedAt: now,
  };
};

export const getSettingsFile = async (): Promise<SettingsFile> => {
  let file;
  try {
    file = await storage.getFile(settingsFileName, {
      decrypt: false,
    });
  } catch (error) {
    if (error.code !== 'does_not_exist') {
      throw error;
    }
  }
  if (file) {
    if (file instanceof ArrayBuffer) {
      file = new TextDecoder().decode(file);
    }
    file = JSON.parse(file);
  }
  if (!file) {
    file = {};
  }
  return file;
};

export const saveSettingsFile = async (
  settings: SettingsFile,
): Promise<void> => {
  await storage.putFile(settingsFileName, JSON.stringify(settings), {
    encrypt: false,
  });
};

export const isValidHttpUrl = (url: string) => {
  let testUrl: URL;

  try {
    testUrl = new URL(url);
  } catch (e) {
    return false;
  }
  return testUrl.protocol === 'http:' || testUrl.protocol === 'https:';
};

/**
 * Following File
 */
const followingFileName = 'app-data/following.json';

export interface GaiaUserFollowing {
  following: { [key: string]: { createdAt: number } };
  updatedAt: number;
}

export const getFollowingFile = async (): Promise<GaiaUserFollowing> => {
  let originalFile: string | null = null;
  try {
    originalFile = (await storage.getFile(followingFileName, {
      decrypt: false,
    })) as string;
  } catch (error) {
    if (error.code !== 'does_not_exist') {
      throw error;
    }
  }
  let file: GaiaUserFollowing;
  if (originalFile) {
    file = JSON.parse(originalFile);
  } else {
    file = {
      following: {},
      updatedAt: Date.now(),
    };
  }
  return file;
};

export const saveFollowingFile = async (
  file: GaiaUserFollowing,
): Promise<void> => {
  await storage.putFile(followingFileName, JSON.stringify(file), {
    encrypt: false,
  });
};
