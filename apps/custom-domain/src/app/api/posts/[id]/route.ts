import { NextResponse } from 'next/server';
import { lookupProfile } from 'micro-stacks/storage';
import { sites } from '@/sites';

export const runtime = 'edge';

export async function GET(
  request: Request,
  { params }: { params: { id: string } },
) {
  const { searchParams } = new URL(request.url);
  const siteParam = searchParams.get('site');
  const postId = params.id;

  const site = sites[siteParam || ''];
  if (!site) {
    return NextResponse.json(null);
  }

  const userProfile = await lookupProfile({ username: site.username });
  const appUrl = 'https://app.sigle.io';
  const bucketUrl = userProfile?.apps?.[appUrl];

  const data = await fetch(`${bucketUrl}${postId}.json`);
  // Story doesn't exist
  if (data.status === 404) {
    return NextResponse.json(null);
  }

  const post = await data.json();

  return NextResponse.json(post);
}
