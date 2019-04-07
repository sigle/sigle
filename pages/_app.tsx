import React from 'react';
import App, { Container } from 'next/app';
import { UserSession, AppConfig } from 'blockstack';
import { configure, getConfig, User } from 'radiks';
import { ThemeProvider, createGlobalStyle } from 'styled-components';
import { theme } from '../client/theme';
import { config } from '../client/config';
// TODO see how to inject it with styled-components
import '../client/generated/tailwind.css';

const GlobalStyle = createGlobalStyle`
  body {
    font-family: 'Roboto', sans-serif;
  }
`;

const makeUserSession = () => {
  const appConfig = new AppConfig(
    ['store_write', 'publish_data'],
    config.apiUrl
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
      apiServer: config.apiUrl,
      userSession,
    });
  }

  async componentDidMount() {
    const { userSession } = getConfig();
    if (userSession.isSignInPending()) {
      await userSession.handlePendingSignIn();
      await User.createWithCurrentUser();
    }
    const user = await userSession.loadUserData();
    console.log(user);
  }

  render() {
    const { Component, pageProps } = this.props;

    return (
      <Container>
        <ThemeProvider theme={theme}>
          <React.Fragment>
            <GlobalStyle />
            <Component {...pageProps} />
          </React.Fragment>
        </ThemeProvider>
      </Container>
    );
  }
}

export default MyApp;
