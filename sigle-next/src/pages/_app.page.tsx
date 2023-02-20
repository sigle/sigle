import type { AppProps } from 'next/app';
import Head from 'next/head';
import { Inter } from '@next/font/google';
import { ThemeProvider } from 'next-themes';
import dynamic from 'next/dynamic';
import { ReactRelayContext } from 'react-relay';
import 'tippy.js/dist/tippy.css';
import 'tippy.js/themes/light-border.css';
import { darkTheme, globalCss } from '@sigle/stitches.config';
import { useRelayStore } from '@/lib/relay';
import { tailwindStyles } from '@/styles/tailwind';

/**
 * Lazy load the WagmiProvider as it's huge to avoid bloating the main bundle
 */
const WagmiProvider = dynamic(
  () => import('../components/Ethereum/WagmiProvider')
);
const CeramicProvider = dynamic(
  () => import('../components/Ceramic/CeramicProvider')
);

const inter = Inter({
  subsets: ['latin'],
  style: ['normal'],
  weight: ['400', '600', '700'],
  variable: '--font-inter',
  display: 'swap',
});

const globalStyle = globalCss({
  ...tailwindStyles,
  body: {
    ...tailwindStyles.body,
    fontFamily: 'var(--font-inter)',
    backgroundColor: '$gray1',
    color: '$gray11',
  },
});

export default function App({ Component, pageProps }: AppProps) {
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
          <WagmiProvider>
            <CeramicProvider>
              <Component {...pageProps} />
            </CeramicProvider>
          </WagmiProvider>
        </ReactRelayContext.Provider>
      </ThemeProvider>
    </>
  );
}
