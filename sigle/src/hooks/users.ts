import { UseQueryOptions, useQuery } from 'react-query';
import { UserService } from '../external/api';
import { sigleConfig } from '../config';

type GetApiUsersMeReturnType = Awaited<
  ReturnType<typeof UserService.getApiUsersMe>
>;
export const useGetUserMe = (
  options: UseQueryOptions<GetApiUsersMeReturnType, Error> = {}
) =>
  useQuery<GetApiUsersMeReturnType, Error>(
    'get-user-me',
    () => UserService.getApiUsersMe(),
    options
  );

type UserByAddressResponse = {
  id: string;
  stacksAddress: string;
  subscription?: {
    id: string;
    nftId: number;
  };
} | null;

export const useGetUserByAddress = (
  stacksAddress: string,
  options: UseQueryOptions<UserByAddressResponse, Error> = {}
) =>
  useQuery<UserByAddressResponse, Error>(
    ['get-user-by-address', stacksAddress],
    async () => {
      const res = await fetch(
        `${sigleConfig.apiUrl}/api/users/${stacksAddress}`,
        {
          method: 'GET',
        }
      );
      const json = await res.json();
      if (!res.ok) {
        throw json;
      }
      return json;
    },
    options
  );
