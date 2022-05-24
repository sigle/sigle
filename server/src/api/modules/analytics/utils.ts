import { lookupProfile } from '@stacks/auth';
import { fetch } from 'undici';
import { config } from '../../../config';
import { migrationStories } from '../../../external/gaia';

// Fathom started aggregating full data from this date.
// All queries should start at this date maximum.
export const FATHOM_MAX_FROM_DATE = '2021-04-01';

export const getBucketUrl = async ({ username }: { username: string }) => {
  let userProfile: Record<string, any> | undefined;
  try {
    userProfile = await lookupProfile({ username });
  } catch (error) {
    // This will happen if there is no blockstack user with this name
    if (error.message === 'Name not found') {
      userProfile = undefined;
    } else {
      throw error;
    }
  }

  const bucketUrl: string | undefined =
    userProfile && userProfile.apps && userProfile.apps[config.APP_URL];

  return { profile: userProfile, bucketUrl };
};

export const getPublicStories = async ({
  bucketUrl,
}: {
  bucketUrl: string;
}) => {
  const resPublicStories = await fetch(`${bucketUrl}publicStories.json`, {
    headers: {
      'Content-Type': 'application/json',
    },
  });
  // This would happen if the user has not published any stories
  if (resPublicStories.status !== 200) {
    return [];
  }
  const publicStoriesFile = migrationStories(
    (await resPublicStories.json()) as any
  );
  return publicStoriesFile.stories;
};
