import { NextApiHandler, NextApiRequest } from 'next';
import * as Sentry from '@sentry/nextjs';
import { lookupProfile } from '@stacks/auth';
import { initFathomClient } from '../../utils/fathomApi';
import { migrationStories } from '../../utils/migrations/stories';

const getBucketUrl = async ({
  req,
  username,
}: {
  req: NextApiRequest;
  username: string;
}) => {
  const appHost =
    (req.headers['x-forwarded-host'] as string) ||
    (req.headers['host'] as string);
  const appProto = (req.headers['x-forwarded-proto'] as string) || 'http';
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

const fathomClient = initFathomClient({
  apiToken: process.env.FATHOM_API_TOKEN!,
  entityId: process.env.FATHOM_ENTITY_ID!,
});

const analyticsEndpoint: NextApiHandler = async (req, res) => {
  // TODO proper error handling

  // TODO this should come from the user session
  const { username } = req.query as { username?: string };
  if (!username) {
    res.status(400).json({ error: 'username is required' });
    return;
  }

  const [subdomain, id, domain] = username.split('.');
  if (!subdomain || !id || !domain) {
    res.status(400).json({ error: 'username is invalid' });
    return;
  }

  const { profile, bucketUrl } = await getBucketUrl({ req, username });
  if (!profile || !bucketUrl) {
    // TODO as this should never happen, report it to Sentry
    res.status(500).json({ error: 'user not found' });
    return;
  }

  const resPublicStories = await fetch(`${bucketUrl}publicStories.json`);
  // This would happen if the user has not published any stories
  if (resPublicStories.status !== 200) {
    res.status(200).json([]);
    return;
  }
  const publicStoriesFile = migrationStories(await resPublicStories.json());
  const storiesPath = publicStoriesFile.stories.map(
    (publicStory) => `/${username}/${publicStory.id}`
  );
  // Add the root path to the list of paths
  storiesPath.push(`/${username}`);

  // TODO batch with max concurrent limit
  const result = await Promise.all(
    storiesPath.map((path) =>
      fathomClient.aggregate({
        entity: 'pageview',
        aggregates: 'visits,pageviews',
        date_grouping: 'month',
        field_grouping: 'pathname',
        sort_by: 'timestamp:asc',
        filters: [
          {
            property: 'pathname',
            operator: 'is',
            value: path,
          },
        ],
      })
    )
  );

  res.status(200).json(result);
};

export default Sentry.withSentry(analyticsEndpoint);
