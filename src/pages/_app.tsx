import React, { useEffect } from 'react';
import App from 'next/app';
import Router from 'next/router';
import Fathom from 'fathom-client';
import { createGlobalStyle } from 'styled-components';
import { DefaultSeo } from 'next-seo';
import { ToastContainer } from 'react-toastify';
// TODO add tippy.js only on the pages that are using it
import 'tippy.js/dist/tippy.css';
import 'tippy.js/themes/light-border.css';
import 'react-toastify/dist/ReactToastify.css';
import '../generated/tailwind.css';
import { config } from '../config';

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
  body {
    font-family: 'Roboto', sans-serif;
  }
`;

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
