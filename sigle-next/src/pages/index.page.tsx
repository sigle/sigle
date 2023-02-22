import { TooltipProvider } from '@radix-ui/react-tooltip';
import { trpc } from '@/utils/trpc';
import { DashboardLayout } from '../components/Dashboard/DashboardLayout';

export default function Home() {
  const hello = trpc.postList.useQuery();
  if (!hello.data) {
    return <div>Loading...</div>;
  }

  console.log(hello.data);

  return (
    <TooltipProvider>
      <DashboardLayout>Hello</DashboardLayout>
    </TooltipProvider>
  );
}
