import type { AppType } from 'next/app';
import Head from 'next/head';
import { Inter } from 'next/font/google';
import { ThemeProvider } from 'next-themes';
import dynamic from 'next/dynamic';
import { ReactRelayContext } from 'react-relay';
import { ClientProvider as StacksClientProvider } from '@micro-stacks/react';
import { SessionProvider } from 'next-auth/react';
import '@/styles/globals.css';
import 'tippy.js/dist/tippy.css';
import 'tippy.js/themes/light-border.css';
import { Session } from 'next-auth';
import { darkTheme, globalCss } from '@sigle/stitches.config';
import { useRelayStore } from '@/lib/relay';
import { trpc } from '@/utils/trpc';
import { AuthModal } from '@/components/AuthModal/AuthModal';
import { Toaster } from '@/ui/Toaster';
import '@/styles/globals.css';

const inter = Inter({
  subsets: ['latin'],
  style: ['normal'],
  weight: ['400', '600', '700'],
  variable: '--font-inter',
  display: 'swap',
});

const CeramicProvider = dynamic(
  () => import('../components/Ceramic/CeramicProvider')
);

const globalStyle = globalCss({
  body: {
    fontFamily: 'var(--font-inter)',
    backgroundColor: '$gray1',
    color: '$gray11',
  },
});

const MyApp: AppType<{ session: Session | null }> = ({
  Component,
  pageProps: { session, ...pageProps },
}) => {
  globalStyle();
  const environment = useRelayStore((store) => store.environment);

  return (
    <>
      <Head>
        <meta name="viewport" content="width=device-width, initial-scale=1.0" />
      </Head>
      <ThemeProvider
        defaultTheme="system"
        attribute="class"
        value={{ light: 'light', dark: darkTheme.className }}
      >
        <ReactRelayContext.Provider value={{ environment }}>
          <SessionProvider session={session}>
            <StacksClientProvider
              appName="Sigle"
              appIconUrl="https://app.sigle.io/icon-192x192.png"
            >
              <CeramicProvider>
                <Component {...pageProps} />
                <AuthModal />
                <Toaster />
              </CeramicProvider>
            </StacksClientProvider>
          </SessionProvider>
        </ReactRelayContext.Provider>
      </ThemeProvider>
    </>
  );
};

export default trpc.withTRPC(MyApp);
