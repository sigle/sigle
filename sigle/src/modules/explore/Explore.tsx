import { useGetUserFollowing } from '../../hooks/appData';
import { Box, LoadingSpinner, Typography } from '../../ui';
import { DashboardLayout } from '../layout';
import { UserCard } from '../userCard/UserCard';

export const ExploreUsers = () => {
  const { isLoading: isLoadingUserFollowing, data: userFollowing } =
    useGetUserFollowing();

  // TODO get data from the API

  return (
    <DashboardLayout>
      <Typography size="h4" css={{ fontWeight: 600, mb: '$7' }}>
        Explore
      </Typography>

      {isLoadingUserFollowing ? (
        <Box css={{ mt: '$10' }}>
          <LoadingSpinner />
        </Box>
      ) : null}

      {userFollowing &&
        Object.keys(userFollowing.following).map((address, index) => (
          <UserCard
            key={index}
            address={address}
            following={!!userFollowing.following[address]}
          />
        ))}
    </DashboardLayout>
  );
};
