import { TooltipProvider } from '@radix-ui/react-tooltip';
import { graphql, useLazyLoadQuery } from 'react-relay';
import { Suspense } from 'react';
import { Container } from '@sigle/ui';
import { useCeramic } from '@/components/Ceramic/CeramicProvider';
import { DashboardLayout } from '@/components/Dashboard/DashboardLayout';
import { UserProfile } from '@/components/UserProfile/UserProfile';
import { UserProfileSkeleton } from '@/components/UserProfile/UserProfileSkeleton';
import { profilePagePostsListQuery } from '@/__generated__/relay/profilePagePostsListQuery.graphql';
import { UserProfilePageHeader } from '@/components/UserProfile/UserProfilePageHeader';
import { StoryCardPublishedSkeleton } from '@/components/StoryCard/StoryCardPublishedSkeleton';
import { UserProfilePosts } from '@/components/UserProfile/UserProfilePosts';

const ProfilePage = () => {
  const data = useLazyLoadQuery<profilePagePostsListQuery>(
    graphql`
      query profilePagePostsListQuery($count: Int!, $cursor: String) {
        viewer {
          id
          profile {
            id
            ...UserProfile_profile
          }
          ...UserProfilePosts_postList
        }
      }
    `,
    {
      count: 20,
    },
    {
      // We always get the latest data from the server so we know we are editing the latest version
      fetchPolicy: 'network-only',
    }
  );

  // TODO 404 if no profile
  if (!data.viewer) return null;

  return (
    <DashboardLayout
      sidebarContent={
        <UserProfile did={data.viewer.id} profile={data.viewer.profile} />
      }
      headerContent={<UserProfilePageHeader />}
    >
      <Container css={{ maxWidth: 680, py: '$5' }}>
        <UserProfilePosts user={data.viewer} />
      </Container>
    </DashboardLayout>
  );
};

export default function ProtectedProfilePage() {
  // TODO auth protect
  const { session } = useCeramic();

  return (
    <TooltipProvider>
      {session ? (
        <Suspense
          fallback={
            <DashboardLayout
              sidebarContent={<UserProfileSkeleton />}
              headerContent={<UserProfilePageHeader />}
            >
              <Container css={{ maxWidth: 680, py: '$5' }}>
                <StoryCardPublishedSkeleton />
                <StoryCardPublishedSkeleton />
                <StoryCardPublishedSkeleton />
              </Container>
            </DashboardLayout>
          }
        >
          <ProfilePage />
        </Suspense>
      ) : null}
    </TooltipProvider>
  );
}
