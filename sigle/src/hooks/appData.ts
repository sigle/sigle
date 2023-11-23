import {
  useMutation,
  useQuery,
  useQueryClient,
  UseQueryOptions,
} from '@tanstack/react-query';
import {
  getSettingsFile,
  GaiaUserFollowing,
  getFollowingFile,
  saveFollowingFile,
} from '../utils';
import {
  fetchUserControllerAddFollow,
  fetchUserControllerRemoveFollow,
} from '@/__generated__/sigle-api';

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
    await saveFollowingFile(userFollowing);
    await fetchUserControllerAddFollow({
      body: { stacksAddress: address, createdAt: now },
    });
    await queryClient.invalidateQueries();
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

    await saveFollowingFile(userFollowing);
    await fetchUserControllerRemoveFollow({
      body: { stacksAddress: address },
    });
    await queryClient.invalidateQueries();
  });
};

export const useGetUserSettings = () =>
  useQuery(['user-settings'], () => getSettingsFile());
