import { useInView } from 'react-cool-inview';
import Link from 'next/link';
import { Button, Flex, LoadingSpinner, Typography } from '@sigle/ui';
import { trpc } from '@/utils/trpc';
import { StoryCardPublishedSkeleton } from '../StoryCard/StoryCardPublishedSkeleton';
import { StoryCardPublished } from '../StoryCard/StoryCardPublished';

export const UserProfilePosts = ({
  isViewer,
  did,
}: {
  isViewer: boolean;
  did: string;
}) => {
  const postList = trpc.post.postList.useInfiniteQuery(
    {
      did,
      limit: 20,
      status: 'PUBLISHED',
    },
    {
      getNextPageParam: (lastPage) => lastPage.nextCursor,
    },
  );

  const { observe } = useInView({
    rootMargin: '50px 0px',
    onEnter: async ({ observe, unobserve }) => {
      // Pause observe when loading data
      unobserve();

      const data = await postList.fetchNextPage();
      if (data.hasNextPage) {
        observe();
      }
    },
  });

  if (postList.isInitialLoading) {
    return (
      <>
        <StoryCardPublishedSkeleton />
        <StoryCardPublishedSkeleton />
        <StoryCardPublishedSkeleton />
      </>
    );
  }

  if (postList.data?.pages[0].items.length === 0 && isViewer) {
    return (
      <>
        <Flex justify="center" direction="column" align="center">
          <Typography color="gray9" fontWeight="semiBold">
            You currently have no published stories
          </Typography>
          <Link href="/editor/new">
            <Button variant="light" size="sm" css={{ mt: '$3', mb: '$5' }}>
              Write your first story
            </Button>
          </Link>
        </Flex>
        <Flex direction="column">
          <StoryCardPublishedSkeleton animate={false} />
          <StoryCardPublishedSkeleton animate={false} />
        </Flex>
      </>
    );
  }
  if (postList.data?.pages[0].items.length === 0 && !isViewer) {
    return (
      <Flex justify="center" direction="column">
        <Typography
          color="gray9"
          fontWeight="semiBold"
          css={{ mb: '$10', textAlign: 'center' }}
        >
          This user has no published stories yet.
        </Typography>
      </Flex>
    );
  }

  return (
    <>
      {postList.data?.pages.map((page) => {
        return page.items.map((item) => {
          return (
            <StoryCardPublished
              key={item.id}
              isViewer={isViewer}
              post={item}
              profile={item.profile}
            />
          );
        });
      })}

      <div ref={observe} />
      {postList.isFetching && (
        <Flex justify="center" mt="4">
          <LoadingSpinner />
        </Flex>
      )}
    </>
  );
};
