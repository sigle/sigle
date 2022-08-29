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

type GetApiUsersFollowingReturnType = Awaited<
  ReturnType<typeof UserService.getApiUsersFollowing>
>;
export const useGetUsersFollowing = (
  userAddress: string,
  options: UseQueryOptions<GetApiUsersFollowingReturnType, Error> = {}
) =>
  useQuery<GetApiUsersFollowingReturnType, Error>(
    ['get-users-following', userAddress],
    () => UserService.getApiUsersFollowing({ userAddress }),
    options
  );

type GetApiUsersFollowersReturnType = Awaited<
  ReturnType<typeof UserService.getApiUsersFollowing>
>;
export const useGetUsersFollowers = (
  userAddress: string,
  options: UseQueryOptions<GetApiUsersFollowersReturnType, Error> = {}
) =>
  useQuery<GetApiUsersFollowersReturnType, Error>(
    ['get-users-followers', userAddress],
    () => UserService.getApiUsersFollowers({ userAddress }),
    options
  );
