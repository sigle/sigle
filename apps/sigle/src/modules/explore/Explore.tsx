import { useInfiniteQuery } from '@tanstack/react-query';
import { useInView } from 'react-cool-inview';
import { fetchUserControllerExplore } from '@/__generated__/sigle-api';
import { useGetGaiaUserFollowing } from '../../hooks/appData';
import { Box, LoadingSpinner, Typography } from '../../ui';
import { DashboardLayout } from '../layout';
import { UserCard } from '../userCard/UserCard';
import { useAuth } from '../auth/AuthContext';

export const ExploreUsers = () => {
  const { user } = useAuth();
  const { data: userFollowing, fetchStatus } = useGetGaiaUserFollowing({
    enabled: !!user,
  });

  const {
    isLoading: isLoadingExplore,
    data: userExplore,
    fetchNextPage,
    hasNextPage,
    isFetchingNextPage,
  } = useInfiniteQuery(
    ['get-user-explore'],
    ({ pageParam }) => {
      return fetchUserControllerExplore({
        queryParams: {
          page: pageParam ? pageParam : 1,
        },
      });
    },
    {
      getNextPageParam: (lastPage) => lastPage.nextPage,
    },
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
      <Typography
        size="h4"
        css={{
          fontWeight: 600,
          pb: '$5',
          borderBottom: '1px solid $colors$gray6',
        }}
      >
        Explore
      </Typography>

      {userExplore &&
        userExplore.pages.map((page) =>
          page.data.map((user) => (
            <UserCard key={user.stacksAddress} address={user.stacksAddress} />
          )),
        )}

      {/* This element is used as a trigger for the infinite scrolling, when it enters
      the view, the client will get the next page from the API */}
      {userFollowing && userExplore && hasNextPage && <div ref={observe} />}

      {fetchStatus === 'fetching' || isLoadingExplore || isFetchingNextPage ? (
        <Box css={{ mt: '$10' }}>
          <LoadingSpinner />
        </Box>
      ) : null}
    </DashboardLayout>
  );
};
