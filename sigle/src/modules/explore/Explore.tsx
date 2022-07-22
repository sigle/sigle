import { useInfiniteQuery } from 'react-query';
import { useInView } from 'react-cool-inview';
import { UserService } from '../../external/api';
import { useGetUserFollowing } from '../../hooks/appData';
import { Box, LoadingSpinner, Typography } from '../../ui';
import { DashboardLayout } from '../layout';
import { UserCard } from '../userCard/UserCard';

export const ExploreUsers = () => {
  const { isLoading: isLoadingUserFollowing, data: userFollowing } =
    useGetUserFollowing();

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

  const { observe, inView } = useInView({
    // For better UX, we can grow the root margin so the data will be loaded earlier
    rootMargin: '50px 0px',
    // When the last item comes to the viewport
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

      {userFollowing &&
        userExplore &&
        userExplore.pages.map((page) =>
          page.data.map((user) => (
            <UserCard
              key={user.stacksAddress}
              // Only the last item should have the observer
              // ref={isLastItem ? observe : null}
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
