import type { AppProps } from 'next/app';
import Head from 'next/head';
import { Inter } from '@next/font/google';
import { ThemeProvider } from 'next-themes';
import dynamic from 'next/dynamic';
import '@sigle/tailwind-style/dist/tailwind.css';
import { darkTheme, globalCss } from '@sigle/stitches.config';

/**
 * Lazy load the WagmiProvider as it's huge to avoid bloating the main bundle
 */
const WagmiProvider = dynamic(() => import('../components/WagmiProvider'));

const inter = Inter({
  subsets: ['latin'],
  style: ['normal'],
  weight: ['400', '600', '700'],
  variable: '--font-inter',
});

const globalStyle = globalCss({
  body: {
    fontFamily: 'var(--font-inter)',
    backgroundColor: '$gray1',
    color: '$gray11',
  },
});

export default function App({ Component, pageProps }: AppProps) {
  globalStyle();

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
        <WagmiProvider>
          <Component {...pageProps} />
        </WagmiProvider>
      </ThemeProvider>
    </>
  );
}
