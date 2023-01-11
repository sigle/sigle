import type { AppProps } from 'next/app';
import Head from 'next/head';
import { Inter } from '@next/font/google';
import '@sigle/tailwind-style/dist/tailwind.css';

const openSans = Inter({
  subsets: ['latin'],
  style: ['normal'],
  weight: ['400', '600', '700'],
});
// TODO remove main tag and use css variables instead

export default function App({ Component, pageProps }: AppProps) {
  return (
    <>
      <Head>
        <meta name="viewport" content="width=device-width, initial-scale=1.0" />
      </Head>
      <main className={openSans.className}>
        <Component {...pageProps} />
      </main>
    </>
  );
}
