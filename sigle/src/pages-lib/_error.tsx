import React from 'react';
import { NextPageContext } from 'next';
import NextErrorComponent from 'next/error';
import styled from 'styled-components';
import tw from 'twin.macro';
import Link from 'next/link';
import * as Sentry from '@sentry/nextjs';
import { Button, Container } from '../components';
import { sigleConfig } from '../config';

const NotFoundContainer = styled(Container)`
  ${tw`mt-8 mb-8 flex flex-col items-center text-center md:flex-row md:text-left`};
`;

const NotFoundTextContainer = styled(Container)`
  ${tw`flex flex-col items-center md:items-start md:pl-8`};
`;

const NotFoundTitle = styled.div`
  ${tw`mb-2 text-5xl`};
`;

const NotFoundSubTitle = styled.div`
  ${tw`mb-8 text-3xl`};
`;

const NotFoundIllu = styled.img`
  ${tw`mt-4 mb-4`};
  width: 300px;
  max-width: 100%;

  @media (min-width: ${sigleConfig.breakpoints.md}px) {
    width: 520px;
  }
`;

interface ErrorProps {
  statusCode: number;
  errorMessage?: string | null;
  hasGetInitialPropsRun?: boolean;
  err?: Error;
}

export const MyError = ({
  statusCode,
  hasGetInitialPropsRun,
  errorMessage,
  err,
}: ErrorProps) => {
  if (!hasGetInitialPropsRun && err) {
    // getInitialProps is not called in case of
    // https://github.com/vercel/next.js/issues/8592. As a workaround, we pass
    // err via _app.js so it can be captured
    Sentry.captureException(err);
    // Flushing is not required in this case as it only happens on the client
  }

  return (
    <NotFoundContainer>
      <NotFoundIllu src="/static/img/jungle.png" alt="One" />
      <NotFoundTextContainer>
        <NotFoundTitle data-testid="error-title">
          {statusCode} in sight!
        </NotFoundTitle>
        <NotFoundSubTitle data-testid="error-sub-title">
          {errorMessage
            ? errorMessage
            : 'Looks like you and Julia went too far...'}
        </NotFoundSubTitle>
        <Link href="/">
          <Button as="a">Go to the app</Button>
        </Link>
      </NotFoundTextContainer>
    </NotFoundContainer>
  );
};

MyError.getInitialProps = async (props: NextPageContext) => {
  const { res, err, asPath } = props;
  const errorInitialProps: ErrorProps & {
    hasGetInitialPropsRun?: boolean;
  } = await NextErrorComponent.getInitialProps(props);

  // Workaround for https://github.com/vercel/next.js/issues/8592, mark when
  // getInitialProps has run
  errorInitialProps.hasGetInitialPropsRun = true;

  // Running on the server, the response object (`res`) is available.
  //
  // Next.js will pass an err on the server if a page's data fetching methods
  // threw or returned a Promise that rejected
  //
  // Running on the client (browser), Next.js will provide an err if:
  //
  //  - a page's `getInitialProps` threw or returned a Promise that rejected
  //  - an exception was thrown somewhere in the React lifecycle (render,
  //    componentDidMount, etc) that was caught by Next.js's React Error
  //    Boundary. Read more about what types of exceptions are caught by Error
  //    Boundaries: https://reactjs.org/docs/error-boundaries.html

  if (res?.statusCode === 404) {
    // Opinionated: do not record an exception in Sentry for 404
    return { statusCode: 404 };
  }
  if (err) {
    Sentry.captureException(err);

    // Flushing before returning is necessary if deploying to Vercel, see
    // https://vercel.com/docs/platform/limits#streaming-responses
    await Sentry.flush(2000);

    return errorInitialProps;
  }

  // If this point is reached, getInitialProps was called without any
  // information about what the error might be. This is unexpected and may
  // indicate a bug introduced in Next.js, so record it in Sentry
  Sentry.captureException(
    new Error(`_error.js getInitialProps missing data at path: ${asPath}`)
  );
  await Sentry.flush(2000);

  return errorInitialProps;
};
