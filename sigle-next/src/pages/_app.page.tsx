import type { AppProps } from 'next/app';
import { Open_Sans } from '@next/font/google';

const openSans = Open_Sans({
  subsets: ['latin'],
  style: ['normal', 'italic'],
  weight: ['300', '400', '600', '700'],
});
// TODO remove main tag and use css variables instead

export default function App({ Component, pageProps }: AppProps) {
  return (
    <main className={openSans.className}>
      <Component {...pageProps} />
    </main>
  );
}
