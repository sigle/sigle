import type { AppProps } from 'next/app';
import Head from 'next/head';
import { Inter } from '@next/font/google';
import { globalCss } from '@stitches/react';
import '@sigle/tailwind-style/dist/tailwind.css';

const inter = Inter({
  subsets: ['latin'],
  style: ['normal'],
  weight: ['400', '600', '700'],
  variable: '--font-inter',
});

const globalStyle = globalCss({
  body: {
    fontFamily: 'var(--font-inter)',
  },
});

export default function App({ Component, pageProps }: AppProps) {
  globalStyle();

  return (
    <>
      <Head>
        <meta name="viewport" content="width=device-width, initial-scale=1.0" />
      </Head>
      <Component {...pageProps} />
    </>
  );
}
