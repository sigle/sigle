import "./globals.css";
import type { Metadata } from "next";
import { Inter } from "next/font/google";
import { env } from "@/env";
import { cn } from "@/lib/cn";
import { Providers } from "./providers";

const inter = Inter({
  subsets: ["latin"],
  display: "swap",
  variable: "--font-inter",
});

export const metadata: Metadata = {
  metadataBase: new URL(env.NEXT_PUBLIC_APP_URL),
  applicationName: "Sigle",
  title: "Sigle | Where Web3 stories come to life",
  description:
    "Sigle is a decentralised open-source platform empowering Web3 creators. Write, share and lock your stories on the blockchain.",
  openGraph: {
    images: [`${env.NEXT_PUBLIC_APP_URL}/images/share.png`],
  },
  robots: {
    follow: false,
    index: false,
  },
  twitter: {
    creator: "@sigleapp",
    site: "www.sigle.io",
    card: "summary_large_image",
  },
};

export default async function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  // TODO this can be passed down to the SessionProvider component
  // That way we would get get ssr with the session properly hydrated
  // However, Next.js doesn't allow client component to access cookies on the server
  // See https://github.com/vercel/next.js/discussions/60640
  // const session = await auth();

  return (
    <html lang="en" suppressHydrationWarning>
      <body
        // oxlint-disable-next-line better-tailwindcss/no-unknown-classes
        className={cn(inter.className, "root antialiased")}
        suppressHydrationWarning
      >
        <Providers>{children}</Providers>
      </body>
    </html>
  );
}
