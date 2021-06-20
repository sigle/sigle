import React, { useEffect } from 'react';
import App from 'next/app';
import Router from 'next/router';
import Head from 'next/head';
import * as Fathom from 'fathom-client';
import { createGlobalStyle, keyframes } from 'styled-components';
import tw from 'twin.macro';
import { DefaultSeo } from 'next-seo';
import { ToastContainer } from 'react-toastify';
import { QueryClient, QueryClientProvider } from 'react-query';
import { ReactQueryDevtools } from 'react-query/devtools';
import NProgress from 'nprogress';
import 'nprogress/nprogress.css';
// TODO add tippy.js only on the pages that are using it
import 'tippy.js/dist/tippy.css';
import 'tippy.js/themes/light-border.css';
import 'react-toastify/dist/ReactToastify.css';
// reach-ui styles
import '@reach/dialog/styles.css';
import '@reach/menu-button/styles.css';
import '@reach/tooltip/styles.css';
import '../styles/fonts.scss';
import '../styles/index.css';
import { sigleConfig } from '../config';
import { colors } from '../utils/colors';
import { AuthProvider } from '../modules/auth/AuthContext';

const queryClient = new QueryClient();

/**
 * Fathom
 */

// Track when page is loaded
const FathomTrack = () => {
  useEffect(() => {
    if (sigleConfig.fathomSiteId) {
      Fathom.load(sigleConfig.fathomSiteId, {
        url: sigleConfig.fathomSiteUrl,
      });
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

const menuAnimation = keyframes`
  0% {
    transform: scale(.9);
    opacity: 0;
  }
  100% {
    transform: scale(1);
    opacity: 1;
  }
`;

const GlobalStyle = createGlobalStyle`
  body {
    font-family: 'Roboto', sans-serif;
  }

  /* For the toasts */
  .reactToastify.Toastify__toast--success {
    background-color: #4db6a1;
  }

  /* For the nprogress bar */
  #nprogress .bar {
    ${tw`bg-pink`};
  }
  #nprogress .peg {
    box-shadow: 0 0 10px ${colors.pink}, 0 0 5px ${colors.pink};
  }
  #nprogress .spinner-icon { 
    border-top-color: ${colors.pink};
    border-left-color: ${colors.pink};
  }

  /* For @reach/menu-button */
  [data-reach-menu-button] {
    :focus {
      outline: 0;
    }
  }
  [data-reach-menu-list] {
    ${tw`py-2 bg-white rounded-lg border shadow-md`};
    min-width: 5rem;
    animation: ${menuAnimation} 75ms cubic-bezier(0, 0, 0.2, 1);
  }
  [data-reach-menu-item] {
    ${tw`px-4 py-2`};
  }
  [data-reach-menu-item][data-selected] {
    ${tw`bg-black text-white lg:text-sm`};
  }
`;

/**
 * Loading bar
 */

Router.events.on('routeChangeStart', () => NProgress.start());
Router.events.on('routeChangeComplete', () => NProgress.done());
Router.events.on('routeChangeError', () => NProgress.done());

/**
 * Force https client side
 * Ideally it should be server side but we would lose the next.js optimisation
 */
const ForceHTTPS = () => {
  useEffect(() => {
    // Only check in production to avoid redirecting localhost
    if (sigleConfig.env === 'production' && location.protocol !== 'https:') {
      location.replace(
        `https:${location.href.substring(location.protocol.length)}`
      );
    }
  }, []);

  return <React.Fragment />;
};
export default class MyApp extends App {
  render() {
    const { Component, pageProps } = this.props;
    // Workaround for https://github.com/zeit/next.js/issues/8592
    const { err } = this.props as any;
    const modifiedPageProps = { ...pageProps, err };

    const seoTitle = 'Sigle | Decentralized blogging platform';
    const seoDescription =
      'A secure, decentralized and open source blogging platform on top of blockstack';

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
            site_name: 'Sigle',
            title: seoTitle,
            description: seoDescription,
            images: [{ url: `${sigleConfig.appUrl}/static/images/share.jpg` }],
          }}
          twitter={{ site: '@sigleapp', cardType: 'summary_large_image' }}
        />
        <GlobalStyle />
        <ForceHTTPS />
        <FathomTrack />
        <QueryClientProvider client={queryClient}>
          <ReactQueryDevtools initialIsOpen={false} />
          <AuthProvider>
            <Component {...modifiedPageProps} />
          </AuthProvider>
        </QueryClientProvider>
        <ToastContainer autoClose={3000} toastClassName="reactToastify" />
      </React.Fragment>
    );
  }
}
