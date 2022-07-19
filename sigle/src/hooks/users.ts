import { UseQueryOptions, useQuery } from 'react-query';
import { UserService } from '../external/api';

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

type GetApiUsersReturnType = Awaited<
  ReturnType<typeof UserService.getApiUsers>
>;
export const useGetUserByAddress = (
  stacksAddress: string,
  options: UseQueryOptions<GetApiUsersReturnType, Error> = {}
) =>
  useQuery<GetApiUsersReturnType, Error>(
    ['get-user-by-address', stacksAddress],
    () => UserService.getApiUsers({ userAddress: stacksAddress }),
    options
  );

type UserExploreResponse = {
  id: string;
  stacksAddress: string;
}[];

export const useGetUserExplore = (
  options: UseQueryOptions<UserExploreResponse, Error> = {}
) =>
  useQuery<UserExploreResponse, Error>(
    'get-user-explore',
    async () => {
      const res = await fetch(`${sigleConfig.apiUrl}/api/users/explore`, {
        method: 'GET',
        credentials: 'include',
        headers: {
          'Content-Type': 'application/json',
        },
      });
      const json = await res.json();
      if (!res.ok) {
        throw json;
      }
      return json;
    },
    options
  );
