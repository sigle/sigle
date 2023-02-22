import { TooltipProvider } from '@radix-ui/react-tooltip';
import { Suspense } from 'react';
import { Container } from '@sigle/ui';
import { StoryCardPublishedSkeleton } from '@/components/StoryCard/StoryCardPublishedSkeleton';
import { trpc } from '@/utils/trpc';
import { DashboardLayout } from '../components/Dashboard/DashboardLayout';

export default function Home() {
  const hello = trpc.postList.useQuery();
  if (!hello.data) {
    return <div>Loading...</div>;
  }

  console.log(hello.data);

  return (
    <TooltipProvider>
      <Suspense
        fallback={
          <DashboardLayout>
            <Container css={{ maxWidth: 680, py: '$5' }}>
              <StoryCardPublishedSkeleton />
              <StoryCardPublishedSkeleton />
              <StoryCardPublishedSkeleton />
            </Container>
          </DashboardLayout>
        }
      >
        <DashboardLayout> </DashboardLayout>
      </Suspense>
      <DashboardLayout>Hello</DashboardLayout>
    </TooltipProvider>
  );
}
