import type { Metadata } from "next";
import { Footer } from "@/components/Layout/Footer";
import { Header } from "@/components/Layout/Header";
import { NextLink } from "@/components/Shared/NextLink";
import { StatusPage } from "@/components/Shared/StatusPage";
import { buttonVariants } from "@/components/ui/button";

export const metadata: Metadata = {
  title: "Page not found | Sigle",
};

export default function NotFound() {
  return (
    <StatusPage
      label="404"
      title="This page doesn’t exist"
      description="The link may be wrong, or the author unpublished this story."
      header={<Header />}
      footer={<Footer />}
    >
      <NextLink href="/" className={buttonVariants({ size: "lg" })}>
        Back to home
      </NextLink>
    </StatusPage>
  );
}
