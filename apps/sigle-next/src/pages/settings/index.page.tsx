import { TooltipProvider } from '@radix-ui/react-tooltip';
import { Container, Flex, Typography, LoadingSpinner } from '@sigle/ui';
import { DashboardLayout } from '@/components/Dashboard/DashboardLayout';
import { useCeramic } from '@/components/Ceramic/CeramicProvider';
import { trpc } from '@/utils/trpc';
import { SettingsCreateProfile } from '@/components/Settings/General/CreateProfile';
import { SettingsUpdateProfile } from '@/components/Settings/General/UpdateProfile';

const Settings = () => {
  const { session } = useCeramic();
  const userDid = session?.did.parent!;

  const profile = trpc.user.userProfile.useQuery({ did: userDid });

  if (profile.isLoading) {
    return (
      <DashboardLayout>
        <Container css={{ maxWidth: 770, py: '$5' }}>
          <Flex justify="center" mt="4">
            <LoadingSpinner />
          </Flex>
        </Container>
      </DashboardLayout>
    );
  }

  if (profile.isError) {
    return (
      <DashboardLayout>
        <Container css={{ maxWidth: 770, py: '$5' }}>
          <Flex justify="center" mt="4">
            <Typography color="orange">
              Error loading profile: {profile.error.message}
            </Typography>
          </Flex>
        </Container>
      </DashboardLayout>
    );
  }

  /**
   * When a user first create an account, there is no profile yet.
   * We need to create one in order to later update it with the data.
   */
  if (profile.isSuccess && !profile.data) {
    return (
      <DashboardLayout>
        <Container css={{ maxWidth: 770, py: '$5' }}>
          <SettingsCreateProfile />
        </Container>
      </DashboardLayout>
    );
  }

  if (profile.data) {
    return <SettingsUpdateProfile profile={profile.data} />;
  }

  return null;
};

export default function ProtectedSettings() {
  // TODO auth protect
  const { session } = useCeramic();

  return <TooltipProvider>{session ? <Settings /> : null}</TooltipProvider>;
}
