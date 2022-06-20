import { fetch } from 'undici';
import { PlausibleClientParams } from '.';

export const plausibleFetch = (clientParams: PlausibleClientParams) => {
  return async (path: string, params: URLSearchParams) => {
    params.append('site_id', clientParams.siteId);

    const response = await fetch(
      `https://plausible.io/api/v1${path}?${params.toString()}`,
      {
        headers: {
          Authorization: `Bearer ${clientParams.apiToken}`,
        },
      }
    );

    if (response.status !== 200) {
      console.error(await response.text());
      throw new Error(`Failed to fetch plausible api: ${response.status}`);
    }

    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    return response.json() as any;
  };
};
