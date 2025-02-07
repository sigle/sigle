import { BetaFeedbackButton } from '@/components/Layout/BetaFeedbackButton';
import { Footer } from '@/components/Layout/Footer';
import { Header } from '@/components/Layout/Header';

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
      <Footer />
    </>
  );
}
