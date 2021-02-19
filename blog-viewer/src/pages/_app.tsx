import { useEffect } from 'react';
import App from 'next/app';
import Router from 'next/router';
import { createGlobalStyle } from 'styled-components';
import * as Fathom from 'fathom-client';
import { initSentry } from '../utils/sentry';
import GlobalStyles from './../components/GlobalStyles';
import '../styles/fonts.scss';
import { sigleConfig } from '../config';

initSentry();

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

const GlobalStyle = createGlobalStyle`
  body {
    font-family: 'Roboto', sans-serif;
  }
`;
export default class MyApp extends App {
  render() {
    const { Component, pageProps } = this.props;

    return (
      <>
        <GlobalStyles />
        <GlobalStyle />
        <FathomTrack />
        <Component {...pageProps} />
      </>
    );
  }
}
