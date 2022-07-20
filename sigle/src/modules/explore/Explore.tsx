import { useGetUserFollowing } from '../../hooks/appData';
import { useGetUserExplore } from '../../hooks/users';
import { Box, LoadingSpinner, Typography } from '../../ui';
import { DashboardLayout } from '../layout';
import { UserCard } from '../userCard/UserCard';

export const ExploreUsers = () => {
  const { isLoading: isLoadingUserFollowing, data: userFollowing } =
    useGetUserFollowing();
  const { isLoading: isLoadingExplore, data: userExplore } =
    useGetUserExplore();

  return (
    <DashboardLayout>
      <Typography size="h2" css={{ fontWeight: 600, mb: '$7' }}>
        Explore
      </Typography>

      {isLoadingUserFollowing || isLoadingExplore ? (
        <Box css={{ mt: '$10' }}>
          <LoadingSpinner />
        </Box>
      ) : null}

      {userFollowing &&
        userExplore &&
        userExplore.map((user, index) => (
          <UserCard
            key={index}
            address={user.stacksAddress}
            userFollowing={userFollowing}
          />
        ))}
    </DashboardLayout>
  );
};
