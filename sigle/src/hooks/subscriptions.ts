import { useMutation, useQuery, useQueryClient } from 'react-query';
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

export const useCreateSubscription = () => {
  const cache = useQueryClient();

  return useMutation(
    (nftId: number) =>
      fetch(`${sigleConfig.apiUrl}/api/subscriptions/creatorPlus`, {
        method: 'POST',
        credentials: 'include',
        body: JSON.stringify({ nftId }),
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
    // {
    //   onSuccess: () => {
    //     cache.invalidateQueries('get-user-subscription');
    //   },
    // }
  );
};
