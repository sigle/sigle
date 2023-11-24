import React, { useEffect } from 'react';
import App from 'next/app';
import Router from 'next/router';
import Head from 'next/head';
import { Open_Sans } from 'next/font/google';
import * as Fathom from 'fathom-client';
import PlausibleProvider from 'next-plausible';
import { DefaultSeo } from 'next-seo';
import { ToastContainer } from 'react-toastify';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { ReactQueryDevtools } from '@tanstack/react-query-devtools';
import { SessionProvider } from 'next-auth/react';
import NProgress from 'nprogress';
import 'nprogress/nprogress.css';
// TODO add tippy.js only on the pages that are using it
import 'tippy.js/dist/tippy.css';
import 'tippy.js/themes/light-border.css';
import 'react-toastify/dist/ReactToastify.css';
import '../globals.css';
import { ThemeProvider } from 'next-themes';
import { Theme } from '@radix-ui/themes';
import { sigleConfig } from '../config';
import { colors } from '../utils/colors';
import { AuthProvider } from '../modules/auth/AuthContext';
import { darkTheme, globalCss } from '../stitches.config';
import { FeatureFlagsProvider } from '../utils/featureFlags';
import { DesignSystemProvider } from '../ui';
import { PlausibleTrack } from '../modules/plausible/PlausibleTrack';
import { PosthogTrack } from '../modules/posthog/PosthogTrack';

const openSans = Open_Sans({
  subsets: ['latin', 'cyrillic'],
  weight: ['300', '400', '600', '700'],
  display: 'swap',
  style: ['normal', 'italic'],
});

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      refetchOnWindowFocus: false,
      retry: false,
    },
  },
});

/**
 * Fathom
 */

// Track when page is loaded
const FathomTrack = () => {
  useEffect(() => {
    if (sigleConfig.fathomSiteId) {
      Fathom.load(sigleConfig.fathomSiteId);
      Fathom.trackPageview();
    }
  }, []);

  return <React.Fragment />;
};

// Track on each page change
Router.events.on('routeChangeComplete', () => {
  Fathom.trackPageview();
});

/**
 * Global style
 */

const GlobalStyle = globalCss({
  'html, body, #root, #__next': {
    height: '100%',
  },

  '#__next': {
    position: 'relative',
    zIndex: 0,
  },

  ':root': {
    '--toastify-color-success': '#4db6a1',
    '--font-open-sans': openSans.style.fontFamily,
  },

  body: {
    fontFamily: '$openSans',
    backgroundColor: '$gray1',
  },

  '#nprogress, .bar': {
    backgroundColor: colors.pink,
  },

  '#nprogress .peg': {
    boxShadow: `0 0 10px ${colors.pink}, 0 0 5px ${colors.pink}`,
  },

  '#nprogress .spinner-icon': {
    borderTopColor: `${colors.pink}`,
    borderLeftColor: `${colors.pink}`,
  },
});

GlobalStyle();

/**
 * Loading bar
 */

Router.events.on('routeChangeStart', () => NProgress.start());
Router.events.on('routeChangeComplete', () => NProgress.done());
Router.events.on('routeChangeError', () => NProgress.done());

export default class MyApp extends App {
  render() {
    const { Component, pageProps } = this.props;
    // Workaround for https://github.com/zeit/next.js/issues/8592
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const { err } = this.props as any;
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const modifiedPageProps: any = { ...pageProps, err };

    const seoTitle = 'Sigle | Where Web3 stories come to life';
    const seoDescription =
      'Sigle is a decentralised open-source platform empowering Web3 creators. Write, share and lock your stories on the blockchain, forever.';

    return (
      <React.Fragment>
        <Head>
          <meta
            name="viewport"
            content="width=device-width, initial-scale=1, shrink-to-fit=no"
          />
        </Head>
        <DefaultSeo
          title={seoTitle}
          description={seoDescription}
          openGraph={{
            type: 'website',
            locale: 'en_EN',
            site_name: 'Sigle',
            title: seoTitle,
            description: seoDescription,
            images: [
              {
                url: `${sigleConfig.appUrl}/img/share.png`,
                alt: `Sigle hero image`,
                width: 1200,
                height: 951,
              },
            ],
          }}
          twitter={{
            handle: '@sigleapp',
            site: 'www.sigle.io',
            cardType: 'summary_large_image',
          }}
        />
        <PlausibleProvider
          domain="app.sigle.io"
          customDomain="app.sigle.io"
          manualPageviews
        >
          <FathomTrack />
          <PlausibleTrack />
          <PosthogTrack />
          <QueryClientProvider client={queryClient}>
            <ReactQueryDevtools initialIsOpen={false} />
            <FeatureFlagsProvider>
              <SessionProvider
                session={modifiedPageProps.session}
                refetchInterval={0}
              >
                <AuthProvider>
                  <ThemeProvider
                    disableTransitionOnChange
                    attribute="class"
                    value={{ light: 'light-theme', dark: darkTheme.toString() }}
                  >
                    <Theme grayColor="gray" accentColor="orange" radius="large">
                      <DesignSystemProvider>
                        <Component {...modifiedPageProps} />
                      </DesignSystemProvider>
                    </Theme>
                  </ThemeProvider>
                </AuthProvider>
              </SessionProvider>
            </FeatureFlagsProvider>
          </QueryClientProvider>
          <ToastContainer autoClose={3000} icon={false} theme="colored" />
        </PlausibleProvider>
      </React.Fragment>
    );
  }
}
