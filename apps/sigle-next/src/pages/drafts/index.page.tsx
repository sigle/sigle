import { TooltipProvider } from '@radix-ui/react-tooltip';
import { useInView } from 'react-cool-inview';
import Link from 'next/link';
import { Button, Container, Flex, LoadingSpinner, Typography } from '@sigle/ui';
import { DashboardLayout } from '@/components/Dashboard/DashboardLayout';
import { useCeramic } from '@/components/Ceramic/CeramicProvider';
import { StoryCardDraft } from '@/components/StoryCard/StoryCardDraft';
import { trpc } from '@/utils/trpc';
import { StoryCardPublishedSkeleton } from '@/components/StoryCard/StoryCardPublishedSkeleton';
import { UserProfile } from '@/components/UserProfile/UserProfile';

const Drafts = () => {
  const { session } = useCeramic();
  const userDid = session?.did.parent!;

  const postList = trpc.post.postList.useInfiniteQuery(
    { limit: 20, did: userDid, status: 'DRAFT' },
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

  if (postList.data?.pages[0].items.length === 0) {
    return (
      <>
        <Flex justify="center" direction="column" align="center">
          <Typography color="gray9" fontWeight="semiBold">
            You don't have any drafts
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

  return (
    <>
      {postList.data?.pages.map((page) => {
        return page.items.map((item) => {
          return <StoryCardDraft key={item.id} post={item} />;
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

export default function ProtectedDrafts() {
  // TODO auth protect
  const { session } = useCeramic();
  const userDid = session?.did.parent!;

  return (
    <TooltipProvider>
      {session ? (
        <DashboardLayout
          headerContent={
            <Flex justify="between" align="center" css={{ flex: 1 }}>
              <Typography size="xl" fontWeight="bold">
                Drafts
              </Typography>
              <Link href="/editor/new">
                <Button>Write story</Button>
              </Link>
            </Flex>
          }
          sidebarContent={<UserProfile did={userDid!} isViewer={true} />}
        >
          <Container css={{ maxWidth: 680, py: '$5' }}>
            <Drafts />
          </Container>
        </DashboardLayout>
      ) : null}
    </TooltipProvider>
  );
}
