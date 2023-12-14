import { AppHeader } from '@/modules/layout/components/AppHeader';

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <>
      <AppHeader />
      {children}
    </>
  );
}
