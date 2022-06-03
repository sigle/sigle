import { useQuery } from 'react-query';
import { sigleConfig } from '../config';
import { ReferrersResponse } from '../modules/analytics/stats/types';
import { FATHOM_MAX_FROM_DATE } from '../modules/analytics/stats/utils';

export const useGetReferrers = () =>
  useQuery('get-analytics-referrer', async () => {
    const res = await fetch(
      `${sigleConfig.apiUrl}/api/analytics/referrers?dateFrom=${FATHOM_MAX_FROM_DATE}`,
      {
        method: 'GET',
        credentials: 'include',
        headers: {
          'Content-Type': 'application/json',
        },
      }
    );
    const json = await res.json();
    if (!res.ok) {
      throw json;
    }
    return json as ReferrersResponse;
  });
