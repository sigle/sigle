import { NextApiHandler, NextApiRequest } from 'next';
import * as Sentry from '@sentry/nextjs';
import { lookupProfile } from '@stacks/auth';
import { migrationStories } from '../../../utils/migrations/stories';
import { initFathomClient } from '../../../external/fathom';

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

const dateFrom = '2021-04-01';

interface AnalyticsResponseError {
  error: string;
}

interface AnalyticsResponse {
  stories: { pathname: string; visits: number; pageviews: number }[];
}

const analyticsEndpoint: NextApiHandler<
  AnalyticsResponseError | AnalyticsResponse
> = async (req, res) => {
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

  // TODO mock during tests
  const { profile, bucketUrl } = await getBucketUrl({ req, username });
  if (!profile || !bucketUrl) {
    // TODO as this should never happen, report it to Sentry
    res.status(500).json({ error: 'user not found' });
    return;
  }

  const resPublicStories = await fetch(`${bucketUrl}publicStories.json`);
  // This would happen if the user has not published any stories
  if (resPublicStories.status !== 200) {
    res.status(200).json({ stories: [] });
    return;
  }
  const publicStoriesFile = migrationStories(await resPublicStories.json());
  const storiesPath = publicStoriesFile.stories.map(
    (publicStory) => `/${username}/${publicStory.id}`
  );
  // Add the root path to the list of paths
  storiesPath.push(`/${username}`);

  // TODO batch with max concurrent limit
  const results = await Promise.all(
    storiesPath.map((path) =>
      fathomClient.aggregate({
        date_from: dateFrom,
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

  console.log(JSON.stringify(results, null, 2));

  const normalizedResponse = results.map(
    (result: { pathname: string; visits: string; pageviews: string }[]) => {
      const pathname = result[0].pathname;
      const totalStats = result.reduce(
        (acc, curr) => {
          acc.visits += Number(curr.visits);
          acc.pageviews += Number(curr.pageviews);
          return acc;
        },
        { pathname, visits: 0, pageviews: 0 }
      );
      return {
        pathname,
        visits: totalStats.visits,
        pageviews: totalStats.pageviews,
      };
    }
  );

  console.log(JSON.stringify(normalizedResponse, null, 2));

  res.status(200).json({ stories: normalizedResponse });
};

export default Sentry.withSentry(analyticsEndpoint);
