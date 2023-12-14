import { sigleConfig } from '@/config';
import { cn } from '@/lib/cn';
import { Metadata } from 'next';
import { Open_Sans } from 'next/font/google';
import { Providers } from './providers';

const openSans = Open_Sans({
  subsets: ['latin', 'cyrillic'],
  weight: ['300', '400', '600', '700'],
  display: 'swap',
  style: ['normal', 'italic'],
  variable: '--font-open-sans',
});

export const metadata: Metadata = {
  title: 'Sigle | Where Web3 stories come to life',
  description:
    'Sigle is a decentralised open-source platform empowering Web3 creators. Write, share and lock your stories on the blockchain, forever.',
  openGraph: {
    type: 'website',
    locale: 'en_EN',
    siteName: 'Sigle',
    images: {
      url: `${sigleConfig.appUrl}/img/share.png`,
      alt: `Sigle share image`,
      width: 1200,
      height: 951,
    },
  },
  twitter: {
    creator: '@sigleapp',
    site: 'www.sigle.io',
    card: 'summary_large_image',
  },
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" suppressHydrationWarning>
      {/* suppressHydrationWarning is used to remove warming from browser extensions */}
      <body
        className={cn(openSans.className, 'antialiased')}
        suppressHydrationWarning
      >
        <Providers>{children}</Providers>
      </body>
    </html>
  );
}
