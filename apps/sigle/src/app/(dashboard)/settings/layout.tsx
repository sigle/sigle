import { Protected } from '@/components/authentication/protected';
import { AppHeader } from '@/components/layout/header/header';

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <Protected>
      <AppHeader />
      {children}
    </Protected>
  );
}
