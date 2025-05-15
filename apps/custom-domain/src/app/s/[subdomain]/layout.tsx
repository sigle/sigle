import { Footer } from "@/component/Layout/Footer";

export const dynamic = "force-dynamic";

export default async function PageLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <>
      <main>{children}</main>
      <Footer />
    </>
  );
}
