import { TooltipProvider } from '@radix-ui/react-tooltip';
import { graphql, useLazyLoadQuery } from 'react-relay';
import { Suspense } from 'react';
import { Container } from '@sigle/ui';
import { useCeramic } from '@/components/Ceramic/CeramicProvider';
import { DashboardLayout } from '@/components/Dashboard/DashboardLayout';
import { UserProfile } from '@/components/UserProfile/UserProfile';
import { UserProfileSkeleton } from '@/components/UserProfile/UserProfileSkeleton';
import { profilePagePostsListQuery } from '@/__generated__/relay/profilePagePostsListQuery.graphql';
import { StoryCardPublished } from '@/components/StoryCard/StoryCardPublished';
import { UserProfilePageHeader } from '@/components/UserProfile/UserProfilePageHeader';
import { StoryCardPublishedSkeleton } from '@/components/StoryCard/StoryCardPublishedSkeleton';

const ProfilePage = () => {
  const data = useLazyLoadQuery<profilePagePostsListQuery>(
    graphql`
      query profilePagePostsListQuery {
        viewer {
          id
          profile {
            id
            ...UserProfile_profile
          }
          postList(first: 10) {
            pageInfo {
              hasNextPage
              hasNextPage
              startCursor
              endCursor
            }
            edges {
              node {
                id
                ...StoryCardPublished_post
              }
            }
          }
        }
      }
    `,
    {},
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
        {data.viewer.postList?.edges?.map((node) => (
          <StoryCardPublished
            key={node?.node?.id}
            did={data.viewer!.id}
            story={node!.node!}
          />
        ))}
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