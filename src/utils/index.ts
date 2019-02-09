import * as blockstack from 'blockstack';
import nanoid from 'nanoid';
import { createBrowserHistory } from 'history';
import { Value } from 'slate';
import Plain from 'slate-plain-serializer';
import { StoryFile, Story, SubsetStory } from '../types';

export const history = createBrowserHistory();

const storiesFileName = 'stories.json';
const publicStoriesFileName = 'publicStories.json';

export const getStoriesFile = async (): Promise<StoryFile> => {
  let file = await blockstack.getFile(storiesFileName);
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
  await blockstack.putFile(storiesFileName, JSON.stringify(file));
  const publickStoriesFile = {
    stories: file.stories.filter(s => s.type === 'public'),
  };
  await blockstack.putFile(
    publicStoriesFileName,
    JSON.stringify(publickStoriesFile),
    {
      encrypt: false,
    }
  );
};

export const getStoryFile = async (storyId: string): Promise<Story | null> => {
  const originalFile = await blockstack.getFile(`${storyId}.json`, {
    decrypt: false,
  });
  let file;
  if (originalFile) {
    file = JSON.parse(originalFile);
  }
  if (file.mac) {
    file = JSON.parse(blockstack.decryptContent(originalFile));
  }
  return file;
};

export const saveStoryFile = async (file: Story): Promise<void> => {
  await blockstack.putFile(`${file.id}.json`, JSON.stringify(file), {
    encrypt: file.type === 'private',
  });
};

export const deleteStoryFile = async (file: Story): Promise<void> => {
  await blockstack.putFile(`${file.id}.json`, JSON.stringify(null));
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

  const index = storiesFile.stories.findIndex(s => s.id === story.id);
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

  const storiesFile = await getStoriesFile();
  const index = storiesFile.stories.findIndex(s => s.id === story.id);
  if (index === -1) {
    throw new Error('File not found in list');
  }
  storiesFile.stories[index].type = 'private';

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
    content: {
      document: {
        nodes: [
          {
            object: 'block',
            type: 'paragraph',
            nodes: [
              {
                object: 'text',
                leaves: [
                  {
                    text: '',
                  },
                ],
              },
            ],
          },
        ],
      },
    },
    createdAt: now,
    updatedAt: now,
  };
};

const CONTENT_SUBSET_SIZE = 200;

export const convertStoryToSubsetStory = (story: Story): SubsetStory => {
  const plainContent = Plain.serialize(Value.fromJSON(story.content));

  return {
    id: story.id,
    title: story.title,
    content:
      plainContent.length > CONTENT_SUBSET_SIZE
        ? plainContent.substring(0, CONTENT_SUBSET_SIZE) + '...'
        : plainContent,
    image: story.image,
    type: story.type,
    createdAt: story.createdAt,
    updatedAt: story.updatedAt,
  };
};
