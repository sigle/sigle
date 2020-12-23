import { NextApiHandler } from 'next';
import { lookupProfile } from 'blockstack';
import { GraphQLClient } from 'graphql-request';
import * as Sentry from '@sentry/node';
import { sigleConfig } from '../../config';
import { Story } from '../../types';
import { getSdk, StoryInput } from '../../generated/graphql';

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

  const appHost =
    (req.headers['x-forwarded-host'] as string) ||
    (req.headers['host'] as string);
  const appProto = (req.headers['x-forwarded-proto'] as string) || 'http';
  const appUrl = `${appProto}://${appHost}`;

  const bucketUrl = userProfile?.apps?.[appUrl];
  if (bucketUrl) {
    let file: Story;
    const data = await fetch(`${bucketUrl}${storyId}.json`);
    if (data.status === 200) {
      file = await data.json();

      // Object that will replace the current db value
      const latestStoryData: StoryInput = {
        id: storyId,
        username,
        title: file.title,
        content: file.content ? JSON.stringify(file.content) : '',
        // TODO time to read
        coverImage: file.coverImage,
        metaTitle: file.metaTitle,
        metaDescription: file.metaDescription,
        featured: file.featured,
        createdAt: new Date(file.createdAt),
        updatedAt: new Date(file.updatedAt),
      };

      const client = new GraphQLClient('https://graphql.fauna.com/graphql', {
        headers: {
          Authorization: `Bearer ${sigleConfig.faunaSecret}`,
        },
      });
      const sdk = getSdk(client);

      try {
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
      } catch (error) {
        Sentry.withScope((scope) => {
          scope.setExtras({
            username,
            storyId,
          });
          Sentry.captureException(error);
        });
        throw error;
      }
    } else {
      Sentry.withScope((scope) => {
        scope.setExtras({
          username,
          storyId,
          httpStatus: data.status,
        });
        Sentry.captureMessage('[update_story] Failed to get gaia object');
      });
    }
  }

  res.statusCode = 200;
  res.setHeader('Content-Type', 'application/json');
  res.end(JSON.stringify({ success: true }));
};
