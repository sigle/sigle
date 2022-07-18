import { useMutation, UseMutationOptions, useQuery } from 'react-query';
import { sigleConfig } from '../config';
import {
  Configuration,
  ApiSubscriptionsGet200Response,
  SubscriptionApi,
  ApiSubscriptionsCreatorPlusPost200Response,
} from '../external/api';

const configuration = new Configuration({
  basePath: sigleConfig.apiUrl,
  credentials: 'include',
});
const subscriptionApi = new SubscriptionApi(configuration);

export const useGetUserSubscription = () =>
  useQuery<ApiSubscriptionsGet200Response, Error>('get-user-subscription', () =>
    subscriptionApi.apiSubscriptionsGet()
  );

export const useCreateSubscription = (
  options: UseMutationOptions<
    ApiSubscriptionsCreatorPlusPost200Response,
    Error,
    number
  > = {}
) =>
  useMutation<ApiSubscriptionsCreatorPlusPost200Response, Error, number>(
    (nftId) =>
      subscriptionApi.apiSubscriptionsCreatorPlusPost({ body: { nftId } }),
    options
  );
