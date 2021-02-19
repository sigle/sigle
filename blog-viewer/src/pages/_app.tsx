import App from 'next/app';
import { createGlobalStyle } from 'styled-components';
import { init } from '../utils/sentry';
import GlobalStyles from './../components/GlobalStyles';
import '../styles/fonts.scss';

init();

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
        <Component {...pageProps} />
      </>
    );
  }
}
