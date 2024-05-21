import { NextApiHandler } from 'next';
import { Feed } from 'feed';
import {
  fetchGaiaControllerGetUserSettings,
  fetchGaiaControllerGetUserStories,
} from '@/__generated__/sigle-api';

const escapeXml = (unsafe: string) => {
  return unsafe.replace(/[<>&'" ]/g, (c) => {
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
      case ' ':
        return '%20';
      default:
        return c;
    }
  });
};

export const apiFeed: NextApiHandler = async (req, res) => {
  const { username } = req.query as { username: string };

  const appHost =
    (req.headers['x-forwarded-host'] as string) ||
    (req.headers['host'] as string);
  const appProto = (req.headers['x-forwarded-proto'] as string) || 'http';
  const appUrl = `${appProto}://${appHost}`;
  const blogLink = `${appUrl}/${username}`;

  const [settings, stories] = await Promise.all([
    fetchGaiaControllerGetUserSettings({
      pathParams: { username },
    }),
    fetchGaiaControllerGetUserStories({
      pathParams: { username },
    }),
  ]);

  const feed = new Feed({
    title: settings.siteName || username,
    description: settings.siteDescription || undefined,
    id: blogLink,
    link: blogLink,
    favicon: `${appUrl}/favicon/apple-touch-icon.png`,
    copyright: `All rights reserved ${new Date().getFullYear()}, ${username}`,
    author: {
      name: username,
      link: blogLink,
    },
  });

  stories.forEach((story) => {
    const storyLink = `${appUrl}/${username}/${story.id}`;

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

export default apiFeed;
