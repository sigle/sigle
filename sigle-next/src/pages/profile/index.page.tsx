import Link from 'next/link';
import { TooltipProvider } from '@radix-ui/react-tooltip';
import { Button, Container, Flex, Typography } from '@sigle/ui';
import { useCeramic } from '@/components/Ceramic/CeramicProvider';
import { DashboardLayout } from '@/components/Dashboard/DashboardLayout';
import { UserProfile } from '@/components/UserProfile/UserProfile';
import { UserProfileSkeleton } from '@/components/UserProfile/UserProfileSkeleton';

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
  const showSkeleton = true;

  return (
    <DashboardLayout
      sidebarContent={showSkeleton ? <UserProfileSkeleton /> : <UserProfile />}
      headerContent={<ProfilePageHeaderContent />}
    >
      <Container css={{ maxWidth: 680, py: '$5' }}></Container>
    </DashboardLayout>
  );
};

export default function ProtectedProfilePage() {
  // TODO auth protect
  const { session } = useCeramic();

  return <TooltipProvider>{session ? <ProfilePage /> : null}</TooltipProvider>;
}
