import React from 'react';
import { NextPageContext } from 'next';
import styled from 'styled-components';
import Link from 'next/link';
import * as Sentry from '@sentry/node';
import { Button, Container } from '../components';
import { config } from '../config';

const NotFoundIllu = styled.img`
  width: 300px;

  @media (min-width: ${config.breakpoints.md}px) {
    width: 520px;
  }
`;

interface ErrorProps {
  statusCode: number;
}

const MyError = ({ statusCode }: ErrorProps) => {
  return (
    <Container className="mt-8 mb-8 flex flex-col items-center text-center md:flex-row md:text-left">
      <NotFoundIllu
        className="mt-4 mb-4"
        src="/static/img/jungle.png"
        alt="One"
      />
      <Container className="flex flex-col items-center md:items-start md:pl-8">
        <div className="mb-2 text-5xl">{statusCode} in sight!</div>
        <div className="mb-8 text-3xl">
          Looks like you and Julia went too far...
        </div>
        <Link href="/">
          <Button as="a">Go to the app</Button>
        </Link>
      </Container>
    </Container>
  );
};

MyError.getInitialProps = ({ res, err, asPath }: NextPageContext) => {
  const statusCode = res ? res.statusCode : err ? err.statusCode : 404;

  // Workaround for https://github.com/zeit/next.js/issues/8592, mark when
  // getInitialProps has run
  const hasGetInitialPropsRun = true;

  const errorInitialProps = { statusCode, hasGetInitialPropsRun };

  if (res) {
    // Running on the server, the response object is available.
    //
    // Next.js will pass an err on the server if a page's `getInitialProps`
    // threw or returned a Promise that rejected

    if (res.statusCode === 404) {
      // Opinionated: do not record an exception in Sentry for 404
      return { statusCode: 404 };
    }

    if (err) {
      Sentry.captureException(err);

      return errorInitialProps;
    }
  } else {
    // Running on the client (browser).
    //
    // Next.js will provide an err if:
    //
    //  - a page's `getInitialProps` threw or returned a Promise that rejected
    //  - an exception was thrown somewhere in the React lifecycle (render,
    //    componentDidMount, etc) that was caught by Next.js's React Error
    //    Boundary. Read more about what types of exceptions are caught by Error
    //    Boundaries: https://reactjs.org/docs/error-boundaries.html
    if (err) {
      Sentry.captureException(err);

      return errorInitialProps;
    }
  }

  // If this point is reached, getInitialProps was called without any
  // information about what the error might be. This is unexpected and may
  // indicate a bug introduced in Next.js, so record it in Sentry
  Sentry.captureException(
    new Error(`error.js getInitialProps missing data at path: ${asPath}`)
  );

  return errorInitialProps;
};

export default MyError;
