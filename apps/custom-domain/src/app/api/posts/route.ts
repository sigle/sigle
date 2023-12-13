import { NextResponse } from 'next/server';
import { lookupProfile } from '@stacks/auth';
import { sites } from '@/sites';

export const runtime = 'edge';

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const siteParam = searchParams.get('site');
  const page = Number(searchParams.get('page')) || 1;

  const site = sites[siteParam || ''];
  if (!site) {
    return NextResponse.json(null);
  }

  const userProfile = await lookupProfile({ username: site.username });
  const appUrl = 'https://app.sigle.io';
  const bucketUrl = userProfile?.apps?.[appUrl];

  const data = await fetch(`${bucketUrl}publicStories.json`);
  const posts = data.status === 404 ? { stories: [] } : await data.json();

  // Paginate by creating slice of 15 based on page number
  const startIndex = (page - 1) * 15;
  const endIndex = page * 15;
  const count = posts.stories.length;
  posts.stories = posts.stories.slice(startIndex, endIndex);

  return NextResponse.json({
    count,
    posts: posts.stories,
  });
}
