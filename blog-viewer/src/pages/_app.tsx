import { useEffect } from 'react';
import App from 'next/app';
import Router from 'next/router';
import { createGlobalStyle } from 'styled-components';
import tw from 'twin.macro';
import * as Fathom from 'fathom-client';
import { DefaultSeo } from 'next-seo';
import NProgress from 'nprogress';
import 'nprogress/nprogress.css';
import { colors } from '../utils/colors';
import GlobalStyles from './../components/GlobalStyles';
import '../styles/fonts.scss';
import { sigleConfig } from '../config';

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

  return <></>;
};

// Track on each page change
Router.events.on('routeChangeComplete', () => {
  Fathom.trackPageview();
});

/**
 * Loading bar
 */

Router.events.on('routeChangeStart', () => NProgress.start());
Router.events.on('routeChangeComplete', () => NProgress.done());
Router.events.on('routeChangeError', () => NProgress.done());

const GlobalStyle = createGlobalStyle`
  body {
    font-family: 'Roboto', sans-serif;
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
export default class MyApp extends App {
  render() {
    const { Component, pageProps } = this.props;

    const seoTitle = 'Sigle | Decentralized blogging platform';
    const seoDescription =
      'A secure, decentralized and open source blogging platform on top of blockstack';

    return (
      <>
        <DefaultSeo
          title={seoTitle}
          description={seoDescription}
          openGraph={{
            type: 'website',
            site_name: 'Sigle',
            title: seoTitle,
            description: seoDescription,
            images: [{ url: `https://app.sigle.io/static/images/share.jpg` }],
          }}
          twitter={{ site: '@sigleapp', cardType: 'summary_large_image' }}
        />
        <GlobalStyles />
        <GlobalStyle />
        <FathomTrack />
        <Component {...pageProps} />
      </>
    );
  }
}
