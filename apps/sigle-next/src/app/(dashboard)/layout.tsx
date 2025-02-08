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
      <Header />
      {children}
      <BetaFeedbackButton />
      <Footer />
    </>
  );
}
