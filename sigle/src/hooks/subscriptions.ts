import { useMutation, UseMutationOptions, useQuery } from 'react-query';
import { sigleConfig } from '../config';

type SubscriptionResponse = { id: string; nftId: number } | null;

export const useGetUserSubscription = () =>
  useQuery<SubscriptionResponse, Error>('get-user-subscription', () =>
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

type CreateSubscriptionResponse = { id: string; nftId: number } | null;

export const useCreateSubscription = (
  options: UseMutationOptions<CreateSubscriptionResponse, Error, number> = {}
) =>
  useMutation<CreateSubscriptionResponse, Error, number>(
    (nftId) =>
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
        return json as any;
      }),
    options
  );
