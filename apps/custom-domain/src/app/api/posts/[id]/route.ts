import { NextResponse } from 'next/server';
import { lookupProfile } from 'micro-stacks/storage';
import { getSettings } from '@/lib/api';

export const runtime = 'edge';

export async function GET(
  request: Request,
  { params }: { params: { id: string } },
) {
  const { searchParams } = new URL(request.url);
  const siteParam = searchParams.get('site');
  const postId = params.id;
  if (!siteParam) {
    return NextResponse.json(null);
  }

  const domainSettings = await getSettings({ site: siteParam });
  if (!domainSettings) {
    return NextResponse.json(null);
  }

  const userProfile = await lookupProfile({
    username: domainSettings.username,
  });
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
