import { Inter } from "next/font/google";
import "./globals.css";
import clsx from "clsx";

const inter = Inter({ subsets: ["latin"] });

// TODO handle errors
// TODO setup sentry
// TODO setup RSS
// TODO setup analytics
// TODO canonical url on sigle pages
// TODO Schema markup for google

// TODO verifications published
// - /robots.txt
// - /sitemap.xml
// - /rss.xml
// - analytics
// - favicon
// - metadata

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body
        className={clsx(inter.className, "bg-sigle-background text-sigle-text")}
      >
        {children}
      </body>
    </html>
  );
}
