import { TooltipProvider } from '@radix-ui/react-tooltip';
import { Container } from '@sigle/ui';
import { StoryCardPublishedSkeleton } from '@/components/StoryCard/StoryCardPublishedSkeleton';
import { trpc } from '@/utils/trpc';
import { DashboardLayout } from '../components/Dashboard/DashboardLayout';
import { StoryCardPublished } from '@/components/StoryCard/StoryCardPublished';

const HopePostList = () => {
  const postList = trpc.postList.useQuery();

  if (postList.isLoading) {
    return (
      <>
        <StoryCardPublishedSkeleton />
        <StoryCardPublishedSkeleton />
        <StoryCardPublishedSkeleton />
        <StoryCardPublishedSkeleton />
      </>
    );
  }

  console.log(postList.data);

  return (
    <>
      {postList.data?.map((post) => {
        return (
          <StoryCardPublished
            key={post.id}
            isViewer={false}
            post={post}
            profile={post.profile}
          />
        );
      })}
    </>
  );
};

export default function Home() {
  return (
    <TooltipProvider>
      <DashboardLayout>
        <Container css={{ maxWidth: 680, py: '$5' }}>
          <HopePostList />
        </Container>
      </DashboardLayout>
    </TooltipProvider>
  );
}
