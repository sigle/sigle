import { useInfiniteQuery } from 'react-query';
import { useInView } from 'react-cool-inview';
import { UserService } from '../../external/api';
import { useGetGaiaUserFollowing } from '../../hooks/appData';
import { Box, LoadingSpinner, Typography } from '../../ui';
import { DashboardLayout } from '../layout';
import { UserCard } from '../userCard/UserCard';
import { useAuth } from '../auth/AuthContext';

export const ExploreUsers = () => {
  const { user, isLegacy } = useAuth();
  const { isLoading: isLoadingUserFollowing, data: userFollowing } =
    useGetGaiaUserFollowing({
      enabled: !!user && !isLegacy,
    });

  const {
    isLoading: isLoadingExplore,
    data: userExplore,
    fetchNextPage,
    hasNextPage,
    isFetchingNextPage,
  } = useInfiniteQuery(
    'get-user-explore',
    ({ pageParam }) => {
      return UserService.getApiUsersExplore({
        page: pageParam ? pageParam : 1,
      });
    },
    {
      getNextPageParam: (lastPage) => lastPage.nextPage,
    }
  );

  const { observe } = useInView({
    // For better UX, we can grow the root margin so the data will be loaded earlier
    rootMargin: '50px 0px',
    onEnter: async ({ unobserve, observe }) => {
      // Pause observe when loading data
      unobserve();
      await fetchNextPage();
      // After query is done start observing again
      observe();
    },
  });

  return (
    <DashboardLayout>
      <Typography size="h2" css={{ fontWeight: 600, mb: '$7' }}>
        Explore
      </Typography>

      {userExplore &&
        userExplore.pages.map((page) =>
          page.data.map((user) => (
            <UserCard
              key={user.stacksAddress}
              address={user.stacksAddress}
              userFollowing={userFollowing}
            />
          ))
        )}

      {/* This element is used as a trigger for the infinite scrolling, when it enters
      the view, the client will get the next page from the API */}
      {userFollowing && userExplore && hasNextPage && <div ref={observe} />}

      {isLoadingUserFollowing || isLoadingExplore || isFetchingNextPage ? (
        <Box css={{ mt: '$10' }}>
          <LoadingSpinner />
        </Box>
      ) : null}
    </DashboardLayout>
  );
};
