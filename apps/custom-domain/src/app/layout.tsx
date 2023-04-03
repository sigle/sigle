import clsx from 'clsx';
import { Inter } from 'next/font/google';
import './globals.css';

const inter = Inter({ subsets: ['latin'] });

// TODO handle errors
// TODO setup sentry
// TODO setup RSS
// TODO setup analytics
// TODO canonical url on sigle pages
// TODO add CTA

// TODO verifications published
// - /robots.txt
// - /sitemap.xml
// - /rss.xml
// - ISR
// - analytics
// - favicon
// - metadata

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <body
        className={clsx(inter.className, 'bg-sigle-background text-gray-900')}
      >
        {children}
      </body>
    </html>
  );
}
