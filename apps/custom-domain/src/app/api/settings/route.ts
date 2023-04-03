import { sites } from '@/sites';
import { NextResponse } from 'next/server';

export const runtime = 'edge';

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const siteParam = searchParams.get('site');

  const site = sites[siteParam || ''];
  if (!site) {
    return NextResponse.json(null);
  }

  return NextResponse.json(site);
}
