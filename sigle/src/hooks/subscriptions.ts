import {
  useMutation,
  UseMutationOptions,
  useQuery,
  UseQueryOptions,
} from '@tanstack/react-query';
import { SubscriptionService } from '../external/api';

type GetApiSubscriptionsReturnType = Awaited<
  ReturnType<typeof SubscriptionService.subscriptionControllerGetUserMe>
>;
export const useGetUserSubscription = (
  options: UseQueryOptions<GetApiSubscriptionsReturnType, Error> = {},
) =>
  useQuery<GetApiSubscriptionsReturnType, Error>(
    ['get-user-subscription'],
    () => SubscriptionService.subscriptionControllerGetUserMe(),
    options,
  );
