import { lookupProfile } from '@stacks/auth';
import { NextApiRequest } from 'next';

export const getBucketUrl = async ({
  req,
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
