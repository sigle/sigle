import { TooltipProvider } from '@radix-ui/react-tooltip';
import { useInView } from 'react-cool-inview';
import { Container, Flex, LoadingSpinner } from '@sigle/ui';
import { DashboardLayout } from '@/components/Dashboard/DashboardLayout';
import { useCeramic } from '@/components/Ceramic/CeramicProvider';
import { StoryCardDraft } from '@/components/StoryCard/StoryCardDraft';
import { trpc } from '@/utils/trpc';
import { StoryCardPublishedSkeleton } from '@/components/StoryCard/StoryCardPublishedSkeleton';

const Drafts = () => {
  const { session } = useCeramic();
  const userDid = session?.did.parent!;

  const postList = trpc.postList.useInfiniteQuery(
    { limit: 20, did: userDid },
    {
      getNextPageParam: (lastPage) => lastPage.nextCursor,
    }
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

  return (
    <TooltipProvider>
      {session ? (
        <DashboardLayout>
          <Container css={{ maxWidth: 680, py: '$5' }}>
            <Drafts />
          </Container>
        </DashboardLayout>
      ) : null}
    </TooltipProvider>
  );
}
