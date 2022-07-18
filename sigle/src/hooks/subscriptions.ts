import { useMutation, UseMutationOptions, useQuery } from 'react-query';
import { SubscriptionService } from '../external/api';

export const useGetUserSubscription = () =>
  useQuery<ReturnType<typeof SubscriptionService.getApiSubscriptions>, Error>(
    'get-user-subscription',
    () => SubscriptionService.getApiSubscriptions()
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
