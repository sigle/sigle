import { UseQueryOptions, useQuery } from '@tanstack/react-query';
import { UserService } from '../external/api';

type GetApiUsersMeReturnType = Awaited<
  ReturnType<typeof UserService.userControllerGetUserMe>
>;
export const useGetUserMe = (
  options: UseQueryOptions<GetApiUsersMeReturnType, Error> = {}
) =>
  useQuery<GetApiUsersMeReturnType, Error>(
    ['get-user-me'],
    () => UserService.userControllerGetUserMe(),
    options
  );

type GetApiUsersReturnType = Awaited<
  ReturnType<typeof UserService.userControllerGetUser>
>;
export const useGetUserByAddress = (
  stacksAddress: string,
  options: UseQueryOptions<GetApiUsersReturnType, Error> = {}
) =>
  useQuery<GetApiUsersReturnType, Error>(
    ['get-user-by-address', stacksAddress],
    () => UserService.userControllerGetUser({ userAddress: stacksAddress }),
    options
  );

type GetApiUsersFollowingReturnType = Awaited<
  ReturnType<typeof UserService.userControllerGetUserFollowing>
>;
export const useGetUsersFollowing = (
  userAddress: string,
  options: UseQueryOptions<GetApiUsersFollowingReturnType, Error> = {}
) =>
  useQuery<GetApiUsersFollowingReturnType, Error>(
    ['get-users-following', userAddress],
    () => UserService.userControllerGetUserFollowing({ userAddress }),
    options
  );

type GetApiUsersFollowersReturnType = Awaited<
  ReturnType<typeof UserService.userControllerGetUserFollowers>
>;
export const useGetUsersFollowers = (
  userAddress: string,
  options: UseQueryOptions<GetApiUsersFollowersReturnType, Error> = {}
) =>
  useQuery<GetApiUsersFollowersReturnType, Error>(
    ['get-users-followers', userAddress],
    () => UserService.userControllerGetUserFollowers({ userAddress }),
    options
  );
