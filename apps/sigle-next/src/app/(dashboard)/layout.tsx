import { BetaFeedbackButton } from '@/components/Layout/BetaFeedbackButton';
import { Header } from '@/components/Layout/Header';

export const dynamic = 'force-dynamic';

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <>
      {/* Empty div to fix a scroll issue on page change */}
      {/* https://github.com/vercel/next.js/issues/49427 */}
      <div />
      <Header />
      {children}
      <BetaFeedbackButton />
    </>
  );
}
