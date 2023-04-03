import { sites } from '@/sites';
import { NextResponse } from 'next/server';

export const runtime = 'edge';

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  let siteParam = searchParams.get('site');

  if (process.env.VERCEL_ENV === 'preview' && !siteParam) {
    siteParam = 'blog.nftbot.app';
  }

  const site = sites[siteParam || ''];
  if (!site) {
    return NextResponse.json(null);
  }

  return NextResponse.json(site);
}
