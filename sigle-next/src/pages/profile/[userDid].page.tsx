import { TooltipProvider } from '@radix-ui/react-tooltip';
import { graphql, useLazyLoadQuery } from 'react-relay';
import { Suspense } from 'react';
import { useRouter } from 'next/router';
import { Container } from '@sigle/ui';
import { useCeramic } from '@/components/Ceramic/CeramicProvider';
import { DashboardLayout } from '@/components/Dashboard/DashboardLayout';
import { UserProfile } from '@/components/UserProfile/UserProfile';
import { UserProfileSkeleton } from '@/components/UserProfile/UserProfileSkeleton';
import { UserProfilePageHeader } from '@/components/UserProfile/UserProfilePageHeader';
import { StoryCardPublishedSkeleton } from '@/components/StoryCard/StoryCardPublishedSkeleton';
import { UserProfilePosts } from '@/components/UserProfile/UserProfilePosts';
import { UserDidProfilePageQuery } from '@/__generated__/relay/UserDidProfilePageQuery.graphql';
import { trpc } from '@/utils/trpc';

const ProfilePage = () => {
  const router = useRouter();
  const userDid = router.query.userDid as string;
  const postList = trpc.postList.useQuery({
    did: userDid,
  });

  const data = useLazyLoadQuery<UserDidProfilePageQuery>(
    graphql`
      query UserDidProfilePageQuery($id: ID!, $count: Int!, $cursor: String) {
        node(id: $id) {
          ... on CeramicAccount {
            id
            isViewer
            profile {
              id
            }
            ...UserProfilePosts_postList
          }
        }
      }
    `,
    {
      count: 20,
      id: router.query.userDid as string,
    },
    {}
  );

  // TODO 404 if no user
  if (!data.node) return null;

  return (
    <DashboardLayout
      sidebarContent={
        <UserProfile
          did={data.node.id!}
          isViewer={data.node.isViewer || false}
        />
      }
      headerContent={
        <UserProfilePageHeader
          did={data.node.id!}
          isViewer={data.node.isViewer || false}
        />
      }
    >
      <Container css={{ maxWidth: 680, py: '$5' }}>
        <UserProfilePosts user={data.node} />
      </Container>
    </DashboardLayout>
  );
};

export default function ProtectedProfilePage() {
  // TODO auth protect
  const { session } = useCeramic();
  const router = useRouter();

  if (!router.isReady) return null;

  return (
    <TooltipProvider>
      {session ? (
        <Suspense
          fallback={
            <DashboardLayout sidebarContent={<UserProfileSkeleton />}>
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
