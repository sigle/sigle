import { NextApiHandler } from 'next';
import { lookupProfile } from '@stacks/auth';
import { Feed } from 'feed';
import * as Sentry from '@sentry/nextjs';
import { SettingsFile, StoryFile } from '../../types';
import { migrationSettings } from '../../utils/migrations/settings';
import { migrationStories } from '../../utils/migrations/stories';
import { prismaClient } from '../../utils/prisma';

const escapeXml = (unsafe: string) => {
  return unsafe.replace(/[<>&'"]/g, (c) => {
    switch (c) {
      case '<':
        return '&lt;';
      case '>':
        return '&gt;';
      case '&':
        return '&amp;';
      case "'":
        return '&apos;';
      case '"':
        return '&quot;';
      default:
        return c;
    }
  });
};

export const apiFeed: NextApiHandler = async (req, res) => {
  const appUrl = `${req.headers['x-forwarded-proto'] || 'http'}://${
    req.headers['host']
  }`;

  const resolvedUser = await prismaClient.user.findUnique({
    where: { domain: req.headers['host'] },
  });

  if (!resolvedUser) {
    res.statusCode = 404;
    res.end(`404 not found`);
    return;
  }

  let userProfile;
  try {
    userProfile = await lookupProfile({ username: resolvedUser.username });
  } catch (error) {
    // This will happen if there is no blockstack user with this name
    if (error.message === 'Name not found') {
      res.statusCode = 404;
      res.end(`${resolvedUser.username} not found`);
      return;
    }
    Sentry.captureException(error);
    res.statusCode = 500;
    res.end(`Blockstack lookupProfile returned error: ${error.message}`);
    return;
  }

  const bucketUrl = userProfile?.apps?.[process.env.APP_URL!];
  if (!bucketUrl) {
    res.statusCode = 404;
    res.end(`${resolvedUser.username} is not using the app`);
    return;
  }

  const [resPublicStories, resSettings] = await Promise.all([
    fetch(`${bucketUrl}publicStories.json`),
    fetch(`${bucketUrl}settings.json`),
  ]);

  let file: StoryFile;
  if (resPublicStories.status === 200) {
    file = migrationStories(await resPublicStories.json());
  } else if (resPublicStories.status === 404) {
    // If file is not found we set an empty array to show an empty list
    file = migrationStories();
  } else {
    Sentry.captureException(
      `${resolvedUser.username} failed to fetch public stories with code ${resPublicStories.status}`
    );
    res.statusCode = 500;
    res.end(
      `${resolvedUser.username} failed to fetch public stories with code ${resPublicStories.status}`
    );
    return;
  }

  let settings: SettingsFile;
  if (resSettings.status === 200) {
    settings = migrationSettings(await resSettings.json());
  } else if (resSettings.status === 404) {
    // If file is not found we set an empty object
    settings = migrationSettings();
  } else {
    Sentry.captureException(
      `${resolvedUser.username} failed to settings storied with code ${resSettings.status}`
    );
    res.statusCode = 500;
    res.end(
      `${resolvedUser.username} failed to settings storied with code ${resSettings.status}`
    );
    return;
  }

  const feed = new Feed({
    title: settings.siteName || resolvedUser.username,
    description: settings.siteDescription,
    id: appUrl,
    link: appUrl,
    favicon: `${appUrl}/favicon/apple-touch-icon.png`,
    copyright: `All rights reserved ${new Date().getFullYear()}, ${
      resolvedUser.username
    }`,
    author: {
      name: resolvedUser.username,
      link: appUrl,
    },
  });

  file.stories.forEach((story) => {
    const storyLink = `${appUrl}/${story.id}`;

    feed.addItem({
      title: story.title,
      id: storyLink,
      link: storyLink,
      description: story.content,
      date: new Date(story.createdAt),
      // The url can contains "&", we need to escape it to not have a XML parsing issue.
      image: story.coverImage ? escapeXml(story.coverImage) : undefined,
    });
  });

  res.end(feed.rss2());
};

export default Sentry.withSentry(apiFeed);
