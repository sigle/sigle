import { NextApiHandler } from 'next';
import { lookupProfile } from 'blockstack';
import readingTime from 'reading-time';
import { Value } from 'slate';
import Plain from 'slate-plain-serializer';
import { Story as PrismaStory } from '@prisma/client';
import * as Sentry from '@sentry/node';
import { Story } from '../../types';
import { prismaClient } from '../../utils/prisma';

/**
 * Update the indexer for a user story.
 * If the story does not exist, create it, otherwise update it with latest data.
 */
export const updateStory: NextApiHandler = async (req, res) => {
  if (req.method !== 'POST') {
    res.status(400).json({ success: false });
    return;
  }

  const username = req.body.username as string;
  const storyId = req.body.storyId as string;

  if (!username || !storyId) {
    res.status(400).json({ success: false });
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
      const latestStoryData: Omit<PrismaStory, 'id'> = {
        storyId,
        username,
        title: file.title,
        content: file.content ? JSON.stringify(file.content) : '',
        readingTime: file.content
          ? // Reading time minutes can contains decimals so we round it
            Math.ceil(
              readingTime(Plain.serialize(Value.fromJSON(file.content))).minutes
            )
          : 0,
        coverImage: file.coverImage ?? null,
        metaTitle: file.metaTitle ?? null,
        metaDescription: file.metaDescription ?? null,
        featured: file.featured ?? false,
        createdAt: new Date(file.createdAt),
        updatedAt: new Date(file.updatedAt),
      };

      const dbStory = await prismaClient.story.findUnique({
        where: { storyId_username: { storyId, username } },
      });

      try {
        if (dbStory) {
          await prismaClient.story.update({
            where: { storyId_username: { storyId, username } },
            data: latestStoryData,
          });
        } else {
          await prismaClient.story.create({ data: latestStoryData });
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

  res.json({ success: true });
};
