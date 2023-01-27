import { TooltipProvider } from '@radix-ui/react-tooltip';
import { DashboardLayout } from '../components/Dashboard/DashboardLayout';

export default function Home() {
  return (
    <TooltipProvider>
      <DashboardLayout> </DashboardLayout>
    </TooltipProvider>
  );
}
