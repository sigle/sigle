import { TooltipProvider } from '@radix-ui/react-tooltip';
import Link from 'next/link';
import { Button, Container, Flex, Typography } from '@sigle/ui';
import { StoryCardPublishedSkeleton } from '@/components/StoryCard/StoryCardPublishedSkeleton';
import { trpc } from '@/utils/trpc';
import { StoryCardPublished } from '@/components/StoryCard/StoryCardPublished';
import { DashboardLayout } from '../components/Dashboard/DashboardLayout';

const HopePostList = () => {
  const postList = trpc.postList.useQuery({});

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

  if (postList.error) {
    return <div>{postList.error.message}</div>;
  }

  return (
    <>
      {postList.data.map((post) => {
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
      <DashboardLayout
        headerContent={
          <Flex justify="between" align="center" css={{ flex: 1 }}>
            <Typography size="xl" fontWeight="bold">
              Explore
            </Typography>
            <Link href="/editor/new">
              <Button>Write story</Button>
            </Link>
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
