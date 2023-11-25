import { lookupProfile } from 'micro-stacks/storage';
import { NextResponse } from 'next/server';
import { SettingsFile } from '@/types';
import { getApiUrl } from '@/utils/vercel';

export const runtime = 'edge';

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const siteParam = searchParams.get('site');

  const site = await fetch(
    `${getApiUrl()}/api/domains/settings?domain=${siteParam}`,
  ).then((res) => res.json());

  if (!site) {
    return NextResponse.json(null);
  }

  const userProfile = await lookupProfile({ username: site.username });
  const appUrl = 'https://app.sigle.io';
  const bucketUrl = userProfile?.apps?.[appUrl];

  const data = await fetch(`${bucketUrl}settings.json`);
  let settingsFile: SettingsFile | null;
  if (data.status === 404) {
    settingsFile = {};
  } else {
    settingsFile = await data.json();
  }

  return NextResponse.json({
    ...site,
    url: `https://${siteParam}`,
    name: settingsFile?.siteName || site.username,
    description: settingsFile?.siteDescription || '',
    avatar: settingsFile?.siteLogo || '',
  });
}
