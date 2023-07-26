import { SiteSettings, StoryFile } from '@/types';
import { getAbsoluteUrl } from '@/utils/vercel';

export async function getSettings({
  site,
}: {
  site: string;
}): Promise<SiteSettings | null> {
  const res = await fetch(`${getAbsoluteUrl()}/api/settings?site=${site}`);
  return res.json();
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
  const res = await fetch(`${process.env.API_URL}/api/users/${address}`);
  return res.json();
}
