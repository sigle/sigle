import { NextApiHandler } from 'next';
import { lookupProfile } from 'blockstack';
import { GraphQLClient } from 'graphql-request';
import * as Sentry from '@sentry/node';
import { sigleConfig } from '../../config';
import { Story } from '../../types';
import { getSdk } from '../../generated/graphql';

/**
 * Update the indexer for a user story.
 * If the story does not exist, create it, otherwise update it with latest data.
 */
export const updateStory: NextApiHandler = async (req, res) => {
  if (req.method !== 'POST') {
    res.statusCode = 200;
    res.setHeader('Content-Type', 'application/json');
    res.end(JSON.stringify({ success: false }));
    return;
  }

  const username = req.body.username as string;
  const storyId = req.body.storyId as string;

  if (!username || !storyId) {
    res.statusCode = 400;
    res.setHeader('Content-Type', 'application/json');
    res.end(JSON.stringify({ success: false }));
    return;
  }

  let userProfile: undefined | { apps?: Record<string, string> };
  try {
    userProfile = await lookupProfile(username);
  } catch (error) {
    Sentry.withScope((scope) => {
      scope.setExtras({
        username,
        storyId,
      });
      Sentry.captureException(error);
    });
  }

  // If deployed on vercel we want to get the deployment url to be able to test unmerged pr's
  // If client side we use window.location.origin
  const appUrl = req.headers['x-forwarded-host']
    ? `${req.headers['x-forwarded-proto']}://${req.headers['x-forwarded-host']}`
    : req.headers.host === 'localhost:3000'
    ? 'http://localhost:3000'
    : sigleConfig.appUrl;

  const bucketUrl = userProfile?.apps?.[appUrl];
  if (bucketUrl) {
    let file: Story;
    const data = await fetch(`${bucketUrl}${storyId}.json`);
    if (data.status === 200) {
      file = await data.json();

      const latestStoryData = { id: storyId, username, title: file.title };

      const client = new GraphQLClient('https://graphql.fauna.com/graphql', {
        headers: {
          Authorization: `Bearer ${sigleConfig.faunaSecret}`,
        },
      });
      const sdk = getSdk(client);

      const dbUserStory = await sdk.findUserStory({ id: storyId, username });
      if (dbUserStory.userStory) {
        await sdk.updateUserStory({
          id: dbUserStory.userStory._id,
          data: latestStoryData,
        });
      } else {
        await sdk.createUserStory({
          data: latestStoryData,
        });
      }
    }
  }

  res.json(true);
};
