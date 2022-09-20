import {
  useMutation,
  UseMutationOptions,
  useQuery,
  UseQueryOptions,
} from '@tanstack/react-query';
import { SubscriptionService } from '../external/api';

type GetApiSubscriptionsReturnType = Awaited<
  ReturnType<typeof SubscriptionService.getApiSubscriptions>
>;
export const useGetUserSubscription = (
  options: UseQueryOptions<GetApiSubscriptionsReturnType, Error> = {}
) =>
  useQuery<GetApiSubscriptionsReturnType, Error>(
    ['get-user-subscription'],
    () => SubscriptionService.getApiSubscriptions(),
    options
  );

type PostApiSubscriptionsCreatorPlusReturnType = Awaited<
  ReturnType<typeof SubscriptionService.postApiSubscriptionsCreatorPlus>
>;
export const useCreateSubscription = (
  options: UseMutationOptions<
    PostApiSubscriptionsCreatorPlusReturnType,
    Error,
    number
  > = {}
) =>
  useMutation<PostApiSubscriptionsCreatorPlusReturnType, Error, number>(
    (nftId) =>
      SubscriptionService.postApiSubscriptionsCreatorPlus({ body: { nftId } }),
    options
  );
