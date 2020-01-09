import React, { useEffect } from 'react';
import App from 'next/app';
import Router from 'next/router';
import Fathom from 'fathom-client';
import { createGlobalStyle } from 'styled-components';
import tw from 'tailwind.macro';
import { DefaultSeo } from 'next-seo';
import { ToastContainer } from 'react-toastify';
import { config as blockstackConfig } from 'blockstack';
import NProgress from 'nprogress';
import 'nprogress/nprogress.css';
// TODO add tippy.js only on the pages that are using it
import 'tippy.js/dist/tippy.css';
import 'tippy.js/themes/light-border.css';
import 'react-toastify/dist/ReactToastify.css';
import '../generated/tailwind.css';
import { config } from '../config';
import { colors } from '../utils/colors';

blockstackConfig.logLevel = 'info';

/**
 * Fathom
 */

// Track when page is loaded
const FathomTrack = () => {
  useEffect(() => {
    if (config.fathomSiteId) {
      Fathom.load();
      Fathom.setSiteId(config.fathomSiteId);
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

const GlobalStyle = createGlobalStyle`
  /* roboto-300normal - latin */
  @font-face {
    font-family: 'Roboto';
    font-style: normal;
    font-display: swap;
    font-weight: 300;
    src:
      local('Roboto Light '),
      local('Roboto-Light'),
      url('/fonts/roboto-latin-300.woff2') format('woff2'), /* Super Modern Browsers */
      url('/fonts/roboto-latin-300.woff') format('woff'); /* Modern Browsers */
  }

  /* roboto-300italic - latin */
  @font-face {
    font-family: 'Roboto';
    font-style: italic;
    font-display: swap;
    font-weight: 300;
    src:
      local('Roboto Light italic'),
      local('Roboto-Lightitalic'),
      url('/fonts/roboto-latin-300italic.woff2') format('woff2'), /* Super Modern Browsers */
      url('/fonts/roboto-latin-300italic.woff') format('woff'); /* Modern Browsers */
  }

  /* roboto-400normal - latin */
  @font-face {
    font-family: 'Roboto';
    font-style: normal;
    font-display: swap;
    font-weight: 400;
    src:
      local('Roboto Regular '),
      local('Roboto-Regular'),
      url('/fonts/roboto-latin-400.woff2') format('woff2'), /* Super Modern Browsers */
      url('/fonts/roboto-latin-400.woff') format('woff'); /* Modern Browsers */
  }

  /* roboto-500normal - latin */
  @font-face {
    font-family: 'Roboto';
    font-style: normal;
    font-display: swap;
    font-weight: 500;
    src:
      local('Roboto Medium '),
      local('Roboto-Medium'),
      url('/fonts/roboto-latin-500.woff2') format('woff2'), /* Super Modern Browsers */
      url('/fonts/roboto-latin-500.woff') format('woff'); /* Modern Browsers */
  }

  /* roboto-700normal - latin */
  @font-face {
    font-family: 'Roboto';
    font-style: normal;
    font-display: swap;
    font-weight: 700;
    src:
      local('Roboto Bold '),
      local('Roboto-Bold'),
      url('/fonts/roboto-latin-700.woff2') format('woff2'), /* Super Modern Browsers */
      url('/fonts/roboto-latin-700.woff') format('woff'); /* Modern Browsers */
  }

  /* roboto-700italic - latin */
  @font-face {
    font-family: 'Roboto';
    font-style: italic;
    font-display: swap;
    font-weight: 700;
    src:
      local('Roboto Bold italic'),
      local('Roboto-Bolditalic'),
      url('/fonts/roboto-latin-700italic.woff2') format('woff2'), /* Super Modern Browsers */
      url('/fonts/roboto-latin-700italic.woff') format('woff'); /* Modern Browsers */
  }

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
`;

/**
 * Loading bar
 */

Router.events.on('routeChangeStart', () => NProgress.start());
Router.events.on('routeChangeComplete', () => NProgress.done());
Router.events.on('routeChangeError', () => NProgress.done());

export default class MyApp extends App {
  render() {
    const { Component, pageProps } = this.props;
    const seoTitle = 'Sigle | Decentralized blogging platform';
    const seoDescription =
      'A secure, decentralized and open source blogging platform on top of blockstack';

    return (
      <React.Fragment>
        <DefaultSeo
          title={seoTitle}
          description={seoDescription}
          openGraph={{
            type: 'website',
            // eslint-disable-next-line @typescript-eslint/camelcase
            site_name: 'Sigle',
            title: seoTitle,
            description: seoDescription,
            images: [{ url: `${config.appUrl}/static/images/share.jpg` }],
          }}
          twitter={{ site: '@sigleapp', cardType: 'summary_large_image' }}
        />
        <GlobalStyle />
        <FathomTrack />
        <Component {...pageProps} />
        <ToastContainer autoClose={3000} toastClassName="reactToastify" />
      </React.Fragment>
    );
  }
}
