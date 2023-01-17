import { TooltipProvider } from '@radix-ui/react-tooltip';
import { DashboardLayout } from '../components/Dashboard/Layout';

export default function Home() {
  return (
    <TooltipProvider>
      <DashboardLayout>Hello</DashboardLayout>
    </TooltipProvider>
  );
}
