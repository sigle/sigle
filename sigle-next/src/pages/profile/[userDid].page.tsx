import { TooltipProvider } from '@radix-ui/react-tooltip';
import { useRouter } from 'next/router';
import { Container } from '@sigle/ui';
import { useCeramic } from '@/components/Ceramic/CeramicProvider';
import { DashboardLayout } from '@/components/Dashboard/DashboardLayout';
import { UserProfile } from '@/components/UserProfile/UserProfile';
import { UserProfilePageHeader } from '@/components/UserProfile/UserProfilePageHeader';
import { UserProfilePosts } from '@/components/UserProfile/UserProfilePosts';

const ProfilePage = () => {
  const router = useRouter();
  const { session } = useCeramic();
  const userDid = session?.did.parent!;
  const paramUserDid = router.query.userDid as string;
  const isViewer = userDid === paramUserDid;

  return (
    <DashboardLayout
      sidebarContent={<UserProfile did={paramUserDid} isViewer={isViewer} />}
      headerContent={
        <UserProfilePageHeader did={paramUserDid} isViewer={isViewer} />
      }
    >
      <Container css={{ maxWidth: 680, py: '$5' }}>
        <UserProfilePosts did={paramUserDid} isViewer={isViewer} />
      </Container>
    </DashboardLayout>
  );
};

export default function ProtectedProfilePage() {
  const router = useRouter();

  if (!router.isReady) return null;

  return (
    <TooltipProvider>
      <ProfilePage />
    </TooltipProvider>
  );
}
