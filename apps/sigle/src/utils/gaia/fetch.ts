import { SettingsFile, Story } from '../../types';

export const fetchPublicStories = async (bucketUrl: string) => {
  let file;
  let statusCode: false | number = false;
  const data = await fetch(`${bucketUrl}publicStories.json`);
  if (data.status === 200) {
    file = await data.json();
  } else if (data.status === 404) {
    // If file is not found we set an empty array to show an empty list
    file = { stories: [] };
  } else {
    statusCode = data.status;
  }
  return { file, statusCode };
};

export const fetchSettings = async (
  bucketUrl: string,
): Promise<{ statusCode: false | number; file: SettingsFile }> => {
  let file;
  let statusCode: false | number = false;
  const data = await fetch(`${bucketUrl}settings.json`);
  if (data.status === 200) {
    file = await data.json();
  } else if (data.status === 404) {
    // If file is not found we set an empty object
    file = {};
  } else {
    statusCode = data.status;
  }
  return { file, statusCode };
};

export const fetchPublicStory = async (
  bucketUrl: string,
  storyId: string,
): Promise<{ file: Story; statusCode: false | number }> => {
  let file;
  let statusCode: false | number = false;
  const data = await fetch(`${bucketUrl}${storyId}.json`);
  if (data.status === 200) {
    file = await data.json();
  } else {
    statusCode = data.status;
  }
  return { file, statusCode };
};
