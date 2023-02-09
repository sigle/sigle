import Link from 'next/link';
import { TooltipProvider } from '@radix-ui/react-tooltip';
import { Button, Flex, Typography } from '@sigle/ui';
import { useCeramic } from '@/components/Ceramic/CeramicProvider';
import { DashboardLayout } from '@/components/Dashboard/DashboardLayout';

const ProfilePage = () => {
  return (
    <DashboardLayout
      sidebarContent={
        <>
          <Typography size="lg" fontWeight="bold">
            Recommended
          </Typography>
        </>
      }
      headerContent={
        <Flex justify="between" css={{ flex: 1 }}>
          <Typography size="xl" fontWeight="bold">
            Profile
          </Typography>
          <Link href="/editor/new">
            <Button>Write story</Button>
          </Link>
        </Flex>
      }
    >
      Profile
    </DashboardLayout>
  );
};

export default function ProtectedProfilePage() {
  // TODO auth protect
  const { session } = useCeramic();

  return <TooltipProvider>{session ? <ProfilePage /> : null}</TooltipProvider>;
}
