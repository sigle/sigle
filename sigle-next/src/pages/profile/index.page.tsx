import Link from 'next/link';
import { TooltipProvider } from '@radix-ui/react-tooltip';
import { graphql, useLazyLoadQuery } from 'react-relay';
import { Suspense } from 'react';
import { Button, Container, Flex, Typography } from '@sigle/ui';
import { useCeramic } from '@/components/Ceramic/CeramicProvider';
import { DashboardLayout } from '@/components/Dashboard/DashboardLayout';
import { UserProfile } from '@/components/UserProfile/UserProfile';
import { UserProfileSkeleton } from '@/components/UserProfile/UserProfileSkeleton';
import { profilePagePostsListQuery } from '@/__generated__/relay/profilePagePostsListQuery.graphql';

const ProfilePageHeaderContent = () => {
  return (
    <Flex justify="between" css={{ flex: 1 }}>
      <Typography size="xl" fontWeight="bold">
        Profile
      </Typography>
      <Link href="/editor/new">
        <Button>Write story</Button>
      </Link>
    </Flex>
  );
};

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
      sidebarContent={<UserProfile profile={data.viewer.profile} />}
      headerContent={<ProfilePageHeaderContent />}
    >
      <Container css={{ maxWidth: 680, py: '$5' }}></Container>
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
              headerContent={<ProfilePageHeaderContent />}
            >
              <Container css={{ maxWidth: 680, py: '$5' }}></Container>
            </DashboardLayout>
          }
        >
          <ProfilePage />
        </Suspense>
      ) : null}
    </TooltipProvider>
  );
}
