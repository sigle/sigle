import { lookupProfile } from 'micro-stacks/storage';
import { SettingsFile, SiteSettings, StoryFile } from '@/types';
import { getAbsoluteUrl, getApiUrl } from '@/utils/vercel';

export async function getSettings({
  site,
}: {
  site: string;
}): Promise<SiteSettings | null> {
  const domainSettings = await fetch(
    `${getApiUrl()}/api/domains/settings?domain=${site}`,
  ).then((res) => res.json());
  if (!domainSettings) return null;

  const userProfile = await lookupProfile({
    username: domainSettings.username,
  });
  const appUrl = 'https://app.sigle.io';
  const bucketUrl = userProfile?.apps?.[appUrl];

  const data = await fetch(`${bucketUrl}settings.json`);
  let settingsFile: SettingsFile | null;
  if (data.status === 404) {
    settingsFile = {};
  } else {
    settingsFile = await data.json();
  }

  return {
    ...domainSettings,
    url: `https://${domainSettings.domain}`,
    name: settingsFile?.siteName || domainSettings.username,
    description: settingsFile?.siteDescription || '',
    avatar: settingsFile?.siteLogo || '',
  };
}

export async function getPosts({
  site,
  page,
}: {
  site: string;
  page: number;
}): Promise<{
  count: number;
  posts: {
    id: string;
    coverImage?: string;
    title: string;
    content: string;
    createdAt: number;
  }[];
}> {
  const res = await fetch(
    `${getAbsoluteUrl()}/api/posts?site=${site}&page=${page}`,
  );
  return res.json();
}

export async function getPost({
  site,
  id,
}: {
  site: string;
  id: string;
}): Promise<StoryFile | null> {
  const res = await fetch(`${getAbsoluteUrl()}/api/posts/${id}?site=${site}`);
  return res.json();
}

export async function getSubscription({
  address,
}: {
  address: string;
}): Promise<{ newsletter?: { id: string } } | null> {
  const res = await fetch(`${getApiUrl()}/api/users/${address}`);
  return res.json();
}
