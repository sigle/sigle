import { useQuery } from 'react-query';
import { sigleConfig } from '../config';

export const useGetUserSubscription = () =>
  useQuery('get-user-subscription', () =>
    fetch(`${sigleConfig.apiUrl}/api/subscriptions`, {
      method: 'GET',
      credentials: 'include',
      headers: {
        'Content-Type': 'application/json',
      },
    }).then(async (res) => {
      const json = await res.json();
      if (!res.ok) {
        throw json;
      }
      return json as { id: string; nftId: number } | null;
    })
  );
