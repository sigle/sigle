import {
  useMutation,
  useQuery,
  useQueryClient,
  UseQueryOptions,
} from 'react-query';
import {
  getSettingsFile,
  GaiaUserFollowing,
  getFollowingFile,
  saveFollowingFile,
} from '../utils';

/**
 * Get the app user following from Gaia.
 */
export const useGetUserFollowing = (
  options: UseQueryOptions<GaiaUserFollowing, Error> = {}
) =>
  useQuery<GaiaUserFollowing, Error>(
    'get-user-following',
    () => getFollowingFile(),
    options
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
    queryClient.setQueriesData('get-user-following', userFollowing);
    await saveFollowingFile(userFollowing);
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
    queryClient.setQueriesData('get-user-following', userFollowing);
    await saveFollowingFile(userFollowing);
  });
};

export const useGetUserSettings = () =>
  useQuery('user-settings', () => getSettingsFile());
