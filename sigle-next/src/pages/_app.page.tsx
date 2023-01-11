import type { AppProps } from 'next/app';
import { Inter } from '@next/font/google';

const openSans = Inter({
  subsets: ['latin'],
  style: ['normal'],
  weight: ['400', '600', '700'],
});
// TODO remove main tag and use css variables instead

export default function App({ Component, pageProps }: AppProps) {
  return (
    <main className={openSans.className}>
      <Component {...pageProps} />
    </main>
  );
}
