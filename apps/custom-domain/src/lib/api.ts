import { SiteSettings } from '@/types';
import { getAbsoluteUrl } from '@/utils/vercel';

export async function getSettings({
  site,
}: {
  site: string;
}): Promise<SiteSettings | null> {
  const res = await fetch(`${getAbsoluteUrl()}/api/settings?site=${site}`);
  return res.json();
}
