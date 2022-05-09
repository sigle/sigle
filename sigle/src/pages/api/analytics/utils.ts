import { lookupProfile } from '@stacks/auth';
import { NextApiRequest } from 'next';
import { migrationStories } from '../../../utils/migrations/stories';

// Fathom started aggregating full data from this date.
// All queries should start at this date maximum.
export const FATHOM_MAX_FROM_DATE = '2021-04-01';

export const getBucketUrl = async ({
  username,
}: {
  req: NextApiRequest;
  username: string;
}) => {
  //   const appHost =
  //     (req.headers['x-forwarded-host'] as string) ||
  //     (req.headers['host'] as string);
  //   const appProto = (req.headers['x-forwarded-proto'] as string) || 'http';
  // TODO revert after tests
  // const appUrl = `${appProto}://${appHost}`;
  const appUrl = `https://app.sigle.io`;

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
    userProfile && userProfile.apps && userProfile.apps[appUrl];

  return { profile: userProfile, bucketUrl };
};

export const getPublicStories = async ({
  bucketUrl,
}: {
  bucketUrl: string;
}) => {
  const resPublicStories = await fetch(`${bucketUrl}publicStories.json`);
  // This would happen if the user has not published any stories
  if (resPublicStories.status !== 200) {
    return [];
  }
  const publicStoriesFile = migrationStories(await resPublicStories.json());
  return publicStoriesFile.stories;
};
