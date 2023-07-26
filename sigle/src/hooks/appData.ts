import {
  useMutation,
  useQuery,
  useQueryClient,
  UseQueryOptions,
} from '@tanstack/react-query';
import { UserService } from '../external/api';
import {
  getSettingsFile,
  GaiaUserFollowing,
  getFollowingFile,
  saveFollowingFile,
} from '../utils';

/**
 * Get the app user following from Gaia.
 */
export const useGetGaiaUserFollowing = (
  options: UseQueryOptions<GaiaUserFollowing, Error> = {},
) =>
  useQuery<GaiaUserFollowing, Error>(
    ['get-user-following'],
    () => getFollowingFile(),
    options,
  );

export const useUserFollow = () => {
  const queryClient = useQueryClient();

  return useMutation<
    void,
    Error,
    { userFollowing: GaiaUserFollowing; address: string }
  >(async ({ address, userFollowing }) => {
    const now = Date.now();
    userFollowing.updatedAt = now;
    userFollowing.following[address] = {
      createdAt: now,
    };
    // optimistic update
    queryClient.setQueriesData(['get-user-following'], userFollowing);
    await saveFollowingFile(userFollowing);
    await UserService.userControllerAddFollow({
      requestBody: { stacksAddress: address, createdAt: now },
    });
    await queryClient.invalidateQueries(['get-users-followers']);
    await queryClient.invalidateQueries(['get-users-following']);
    await queryClient.invalidateQueries(['get-user-by-address']);
  });
};

export const useUserUnfollow = () => {
  const queryClient = useQueryClient();

  return useMutation<
    void,
    Error,
    { userFollowing: GaiaUserFollowing; address: string }
  >(async ({ address, userFollowing }) => {
    const now = Date.now();
    userFollowing.updatedAt = now;
    delete userFollowing.following[address];
    // optimistic update
    queryClient.setQueriesData(['get-user-following'], userFollowing);
    await saveFollowingFile(userFollowing);
    await UserService.userControllerRemoveFollow({
      requestBody: { stacksAddress: address },
    });
    await queryClient.invalidateQueries(['get-users-followers']);
    await queryClient.invalidateQueries(['get-users-following']);
    await queryClient.invalidateQueries(['get-user-by-address']);
  });
};

export const useGetUserSettings = () =>
  useQuery(['user-settings'], () => getSettingsFile());
