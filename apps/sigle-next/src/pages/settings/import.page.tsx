import { TooltipProvider } from '@radix-ui/react-tooltip';
import { Button, Container, Input, Typography } from '@sigle/ui';
import { useCeramic } from '@/components/Ceramic/CeramicProvider';
import { DashboardLayout } from '@/components/Dashboard/DashboardLayout';
import { SettingsMenu } from '@/components/Settings/SettingsMenu';
import { useToast } from '@/hooks/useToast';
import { ImportForm } from '@/components/Settings/Import/ImportForm';

// TODO take it from the form
const url = 'https://app.sigle.io/sigle.btc';

const SettingsPlans = () => {
  const { toast } = useToast();

  return (
    <DashboardLayout
      headerContent={
        <Typography size="xl" fontWeight="bold">
          Settings
        </Typography>
      }
    >
      <Container css={{ maxWidth: 770, py: '$5' }}>
        <SettingsMenu />

        <ImportForm />
      </Container>
    </DashboardLayout>
  );
};

export default function ProtectedSettings() {
  // TODO auth protect
  const { session } = useCeramic();

  return (
    <TooltipProvider>{session ? <SettingsPlans /> : null}</TooltipProvider>
  );
}
