import { useQuery, UseQueryOptions } from 'react-query';
import {
  NamesApi,
  BnsGetNameInfoResponse,
} from '@stacks/blockchain-api-client';

export const useGetStacksApiNameInfo = (
  username: string,
  options: UseQueryOptions<BnsGetNameInfoResponse, Error> = {}
) =>
  useQuery<BnsGetNameInfoResponse, Error>(
    ['get-stacks-api-name-info', username],
    () => {
      const stacksNamesApi = new NamesApi();
      return stacksNamesApi.getNameInfo({ name: username });
    },
    options
  );
