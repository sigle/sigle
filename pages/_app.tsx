import React from 'react';
import App, { Container } from 'next/app';
import { UserSession, AppConfig, config as blockstackConfig } from 'blockstack';
import { configure } from 'radiks';
import { ThemeProvider, createGlobalStyle } from 'styled-components';
import { theme } from '../client/theme';
import { config } from '../client/config';
// TODO see how to inject it with styled-components
import '../client/generated/tailwind.css';
import { UserContextProvider } from '../client/context/UserContext';

blockstackConfig.logLevel = 'info';

const GlobalStyle = createGlobalStyle`
  body {
    font-family: 'Roboto', sans-serif;
  }
`;

// TODO set the url of the app to https://app.sigle.io
const makeUserSession = () => {
  const appConfig = new AppConfig(
    ['store_write', 'publish_data'],
    config.appUrl
  );
  return new UserSession({ appConfig });
};

class MyApp extends App {
  static async getInitialProps({ Component, ctx }: any) {
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

    return (
      <Container>
        <UserContextProvider>
          <ThemeProvider theme={theme}>
            <React.Fragment>
              <GlobalStyle />
              <Component {...pageProps} />
            </React.Fragment>
          </ThemeProvider>
        </UserContextProvider>
      </Container>
    );
  }
}

export default MyApp;
