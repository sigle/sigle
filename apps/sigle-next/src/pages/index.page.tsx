import { TooltipProvider } from '@radix-ui/react-tooltip';
import Link from 'next/link';
import { useInView } from 'react-cool-inview';
import { Button, Container, Flex, LoadingSpinner, Typography } from '@sigle/ui';
import { StoryCardPublishedSkeleton } from '@/components/StoryCard/StoryCardPublishedSkeleton';
import { trpc } from '@/utils/trpc';
import { StoryCardPublished } from '@/components/StoryCard/StoryCardPublished';
import { useCeramic } from '@/components/Ceramic/CeramicProvider';
import { useAuthModal } from '@/components/AuthModal/AuthModal';
import { DashboardLayout } from '../components/Dashboard/DashboardLayout';

const HopePostList = () => {
  const postList = trpc.post.postList.useInfiniteQuery(
    { limit: 50, status: 'PUBLISHED' },
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
        <StoryCardPublishedSkeleton />
      </>
    );
  }

  if (postList.error) {
    return <div>{postList.error.message}</div>;
  }

  return (
    <>
      {postList.data?.pages.map((page) => {
        return page.items.map((item) => {
          return (
            <StoryCardPublished
              key={item.id}
              isViewer={false}
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

export default function Home() {
  const { setOpen } = useAuthModal();
  const { session } = useCeramic();
  const userDid = session?.did.parent;

  return (
    <TooltipProvider>
      <DashboardLayout
        headerContent={
          <Flex justify="between" align="center" css={{ flex: 1 }}>
            <Typography size="xl" fontWeight="bold">
              Explore
            </Typography>
            {userDid ? (
              <Link href="/editor/new">
                <Button>Write story</Button>
              </Link>
            ) : (
              <Button onClick={() => setOpen(true)}>Write story</Button>
            )}
          </Flex>
        }
      >
        <Container css={{ maxWidth: 680, py: '$5' }}>
          <HopePostList />
        </Container>
      </DashboardLayout>
    </TooltipProvider>
  );
}
