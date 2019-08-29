import React from 'react';
import App, { AppContext } from 'next/app';
import { UserSession, AppConfig, config as blockstackConfig } from 'blockstack';
import { configure } from 'radiks';
import { ThemeProvider, createGlobalStyle } from 'styled-components';
import { ToastContainer } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import tw from 'tailwind.macro';
import Router from 'next/router';
import Head from 'next/head';
import { theme } from '../client/theme';
import { config } from '../client/config';
// TODO see how to inject it with styled-components
import '../client/generated/tailwind.css';
import { UserContextProvider } from '../client/context/UserContext';
import { pageview } from '../client/utils/fathom';

blockstackConfig.logLevel = 'info';

Router.events.on('routeChangeComplete', () => pageview());

const GlobalStyle = createGlobalStyle`
  body {
    font-family: 'Roboto', sans-serif;
  }

  .reactToastify {
    ${tw`rounded-lg`};
  }
  .reactToastify.Toastify__toast--success {
    background-color: #36A993;
  }
  .reactToastify.Toastify__toast--error {
    background-color: ${config.colors.primary};
  }
`;

const makeUserSession = () => {
  const appConfig = new AppConfig(
    ['store_write', 'publish_data'],
    config.appUrl
  );
  return new UserSession({ appConfig });
};

class MyApp extends App {
  static async getInitialProps({ Component, ctx }: AppContext) {
    let pageProps = {};

    if (Component.getInitialProps) {
      pageProps = await Component.getInitialProps(ctx);
    }

    return { pageProps };
  }

  componentWillMount() {
    const userSession = makeUserSession();
    configure({
      apiServer: config.appUrl,
      userSession,
    });
  }

  render() {
    const { Component, pageProps } = this.props;
    const seoTitle = 'Sigle | Decentralized blog platform';
    const seoDescription =
      'A secure, decentralized and open source blogging platform on top of blockstack';

    return (
      <React.Fragment>
        <Head>
          <title>{seoTitle}</title>
          <meta name="description" content={seoDescription} />
          <meta property="og:type" content="website" />
          <meta property="og:site_name" content="Sigle" />
          <meta property="og:title" content={seoTitle} />
          <meta property="og:description" content={seoDescription} />
          <meta
            property="og:image"
            content={`${config.appUrl}/static/images/share.jpg`}
          />
          <meta name="twitter:site" content="@sigleapp" />
          <meta name="twitter:card" content="summary_large_image" />
        </Head>
        <UserContextProvider>
          <ThemeProvider theme={theme}>
            <React.Fragment>
              <GlobalStyle />
              <ToastContainer autoClose={3000} toastClassName="reactToastify" />
              <Component {...pageProps} />
            </React.Fragment>
          </ThemeProvider>
        </UserContextProvider>
      </React.Fragment>
    );
  }
}

export default MyApp;
