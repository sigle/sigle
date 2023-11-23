import React from 'react';
import { NextPageContext } from 'next';
import NextErrorComponent from 'next/error';
import { styled } from '../stitches.config';
import Link from 'next/link';
import * as Sentry from '@sentry/nextjs';
import { Button, Container, Flex, Heading, Text } from '../ui';
import Image from 'next/legacy/image';
import { useAuth } from '../modules/auth/AuthContext';
import { AppHeader } from '../modules/layout/components/AppHeader';

const NotFoundContainer = styled(Container, {
  display: 'flex',
  flexDirection: 'column',
  justifyContent: 'center',
  alignItems: 'center',
  textAlign: 'center',
  flex: 1,

  '@xl': {
    flexDirection: 'row-reverse',
    textAlign: 'left',
  },
});

const NotFoundTextContainer = styled('div', {
  alignItems: 'center',
  display: 'flex',
  flexDirection: 'column',

  '@md': {
    width: '501px',
  },

  '@lg': {
    alignItems: 'start',
    pr: '$3',
  },

  '@xl': {
    pr: '$3',
  },
});

const NotFoundText = styled(Text, {
  mb: '$6',
  maxWidth: '400px',
});

const NotFoundWrapper = styled('div', {
  width: '300px',
  height: '282px',
  position: 'relative',
  mt: '$4',
  mb: '$4',

  '@lg': {
    minWidth: '520px',
    height: '488px',
  },

  '@2xl': {
    width: '737px',
    height: '693px',
  },
});

const ErrorWrapper = styled('div', {
  width: '300px',
  height: '232px',
  maxWidth: '100%',
  position: 'relative',
  mt: '$4',
  mb: '$4',

  '@lg': {
    width: '520px',
    height: '403px',
  },

  '@2xl': {
    width: '765px',
    height: '593px',
  },
});

interface ErrorProps {
  statusCode: number;
  errorMessage?: string | null;
  hasGetInitialPropsRun?: boolean;
  err?: Error;
  sentryErrorId?: string;
}

export const MyError = ({
  statusCode,
  hasGetInitialPropsRun,
  errorMessage,
  err,
  sentryErrorId,
}: ErrorProps) => {
  const { user } = useAuth();
  const notFound = statusCode === 404;

  if (!hasGetInitialPropsRun && err) {
    // getInitialProps is not called in case of
    // https://github.com/vercel/next.js/issues/8592. As a workaround, we pass
    // err via _app.js so it can be captured
    sentryErrorId = Sentry.captureException(err);
    // Flushing is not required in this case as it only happens on the client
  }

  return (
    <Flex direction="column" css={{ height: '100%' }}>
      <AppHeader />
      <NotFoundContainer>
        {notFound ? (
          <NotFoundWrapper>
            <Image
              src="/static/img/404.png"
              alt="A lost traveller"
              width={737}
              height={693}
              priority
              layout="responsive"
              objectPosition="center"
            />
          </NotFoundWrapper>
        ) : (
          <ErrorWrapper>
            <Image
              src="/static/img/5XX.png"
              alt="Woodpecker and broken pencil"
              width={765}
              height={593}
              priority
              layout="responsive"
              objectPosition="center"
            />
          </ErrorWrapper>
        )}
        <NotFoundTextContainer>
          <Heading
            css={{ mb: '$3', lineHeight: 1 }}
            as="h1"
            size="5xl"
            data-testid="error-title"
          >
            {statusCode}
          </Heading>
          <Heading
            size="xl"
            css={{ mb: '$3', lineHeight: 1.25 }}
            as="h3"
            data-testid="error-sub-title"
          >
            {errorMessage
              ? errorMessage
              : notFound
                ? 'The page could not be found'
                : 'An error has occured'}
          </Heading>
          <NotFoundText>
            {notFound
              ? 'It seems that you got lost into the Sigleverse.'
              : `Oops! It seems that Sigle has stopped working. Please refresh the page or try again later.`}
          </NotFoundText>
          {sentryErrorId && (
            <NotFoundText data-testid="error-id">{`Error ID: ${sentryErrorId}`}</NotFoundText>
          )}
          {notFound ? (
            <Link href="/login" passHref legacyBehavior>
              <Button css={{ mb: '$10' }} as="a" size="lg" color="orange">
                {user ? 'Go back to your dashboard' : 'Log in'}
              </Button>
            </Link>
          ) : (
            <Button
              css={{ mb: '$10' }}
              onClick={() => window.location.reload()}
              size="lg"
              color="orange"
            >
              Refresh the page
            </Button>
          )}
        </NotFoundTextContainer>
      </NotFoundContainer>
    </Flex>
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
    errorInitialProps.sentryErrorId = Sentry.captureException(err);

    // Flushing before returning is necessary if deploying to Vercel, see
    // https://vercel.com/docs/platform/limits#streaming-responses
    await Sentry.flush(2000);

    return errorInitialProps;
  }

  // If this point is reached, getInitialProps was called without any
  // information about what the error might be. This is unexpected and may
  // indicate a bug introduced in Next.js, so record it in Sentry
  errorInitialProps.sentryErrorId = Sentry.captureException(
    new Error(`_error.js getInitialProps missing data at path: ${asPath}`),
  );
  await Sentry.flush(2000);

  return errorInitialProps;
};

export default MyError;
