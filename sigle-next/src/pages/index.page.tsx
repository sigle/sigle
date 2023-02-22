import { TooltipProvider } from '@radix-ui/react-tooltip';
import { trpc } from '@/utils/trpc';
import { DashboardLayout } from '../components/Dashboard/DashboardLayout';

export default function Home() {
  const hello = trpc.hello.useQuery({ text: 'client' });
  if (!hello.data) {
    return <div>Loading...</div>;
  }

  console.log(hello.data);

  return null;

  // return (
  //   <TooltipProvider>
  //     <DashboardLayout> </DashboardLayout>
  //   </TooltipProvider>
  // );
}
