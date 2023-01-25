import { useCeramic } from '@/components/Ceramic/CeramicProvider';
import { DashboardLayout } from '@/components/Dashboard/DashboardLayout';
import { TooltipProvider } from '@radix-ui/react-tooltip';

const Settings = () => {
  return <div>Settings</div>;
};

export default function ProtectedSettings() {
  // TODO auth protect
  const { session } = useCeramic();

  return (
    <TooltipProvider>
      <DashboardLayout>{session ? <Settings /> : null}</DashboardLayout>
    </TooltipProvider>
  );
}
