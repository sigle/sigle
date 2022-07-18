import { useMutation, UseMutationOptions, useQuery } from 'react-query';
import { sigleConfig } from '../config';
import { SubscriptionService } from '../external/api';

// const configuration = new Configuration({
//   basePath: sigleConfig.apiUrl,
//   credentials: 'include',
// });
// const subscriptionApi = new SubscriptionApi(configuration);

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
    (nftId) => SubscriptionService.postApiSubscriptionsCreatorPlus({ nftId }),
    options
  );
