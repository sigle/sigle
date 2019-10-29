import { init } from '@sentry/browser';
import React from 'react';
import ReactDOM from 'react-dom';
import App from './App';
import * as serviceWorker from './serviceWorker';
import './generated/tailwind.css';
import 'typeface-roboto';
import 'typeface-libre-baskerville';
import 'tippy.js/dist/tippy.css';
import 'tippy.js/themes/light-border.css';

/**
 * Sentry should only be active in production
 */
if (process.env.NODE_ENV === 'production') {
  init({
    dsn: 'https://82a06f89d9474f40abd8f2058bbf9c1e@sentry.io/1419975',
    environment: process.env.NODE_ENV,
  });
}

ReactDOM.render(<App />, document.getElementById('root'));

// If you want your app to work offline and load faster, you can change
// unregister() to register() below. Note this comes with some pitfalls.
// Learn more about service workers: http://bit.ly/CRA-PWA
serviceWorker.unregister();
