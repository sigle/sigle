import { TooltipProvider } from '@radix-ui/react-tooltip';
import { Suspense } from 'react';
import { Container } from '@sigle/ui';
import { StoryCardPublishedSkeleton } from '@/components/StoryCard/StoryCardPublishedSkeleton';
import { DashboardLayout } from '../components/Dashboard/DashboardLayout';

export default function Home() {
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
    </TooltipProvider>
  );
}
