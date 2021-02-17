import App from 'next/app';
import { init } from '../utils/sentry';
import GlobalStyles from './../components/GlobalStyles';

init();
export default class MyApp extends App {
  render() {
    const { Component, pageProps } = this.props;

    return (
      <>
        <GlobalStyles />
        <Component {...pageProps} />
      </>
    );
  }
}
