import React /*{ useEffect }*/ from 'react';
import { useEffect } from 'react';
import { NextPageContext } from 'next';
import NextErrorComponent from 'next/error';
import { styled } from '../stitches.config';
import Link from 'next/link';
import * as Sentry from '@sentry/nextjs';
import { Button, Text } from '../ui';
import { Container } from '../ui';
import Image from 'next/image';
import { useAuth } from '../modules/auth/AuthContext';

const NotFoundContainer = styled(Container, {
  '@xs': {
    flexDirection: 'column',
    textAlign: 'center',
  },

  '@lg': {
    flexDirection: 'row-reverse',
    textAlign: 'left',
  },

  px: 0,
  width: '100%',
  display: 'flex',
  alignItems: 'center',
  mx: 'auto',
  mt: '$8',
  mb: '$3',
});

const NotFoundTextContainer = styled(Container, {
  '@xs': {
    alignItems: 'center',
  },

  '@md': {
    width: '501px',
  },

  '@lg': {
    alignItems: 'start',
  },

  px: 0,
  pr: '$5',
  display: 'flex',
  flexDirection: 'column',
});

const NotFoundTitle = styled('h1', {
  mb: '$3',
  lineHeight: 1,

  fontSize: '$9',
  fontWeight: 700,
});

const NotFoundSubTitle = styled('h3', {
  mb: '$6',
  fontSize: '$5',
  fontWeight: 700,
  lineHeight: 1,
});

const NotFoundText = styled(Text, {
  mb: '$6',
  maxWidth: '400px',
});

const NotFoundWrapper = styled('div', {
  '@xs': {
    width: '300px',
    height: '282px',
  },

  '@lg': {
    width: '520px',
    height: '488px',
  },

  '@2xl': {
    width: '737px',
    height: '693px',
  },

  position: 'relative',
  mt: '$4',
  mb: '$4',
  maxWidth: '100%',
});

const ErrorWrapper = styled('div', {
  '@xs': {
    width: '300px',
    height: '232px',
  },

  '@lg': {
    width: '520px',
    height: '403px',
  },

  '@2xl': {
    width: '765px',
    height: '593px',
  },

  position: 'relative',
  mt: '$4',
  mb: '$4',
  maxWidth: '100%',
});

const NotFoundIllu = ({
  statusCode,
  alt,
}: {
  statusCode: number;
  alt: string;
}) => (
  <Image
    src={`/static/img/${statusCode === 404 ? '404' : '5XX'}.png`}
    alt={alt}
    priority
    layout="fill"
    // objectFit="cover"
    objectPosition="center"
  />
);

const NotFoundButton = styled('a', Button);

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
  const { user } = useAuth();
  const notFound = statusCode === 404;
  const fakeId = '1f9be6355d35eb9c0ae242b6a46244e';

  useEffect(() => {
    console.log(Sentry.captureException('error'));
  }, []);

  if (!hasGetInitialPropsRun && err) {
    // getInitialProps is not called in case of
    // https://github.com/vercel/next.js/issues/8592. As a workaround, we pass
    // err via _app.js so it can be captured
    Sentry.captureException(err);
    // Flushing is not required in this case as it only happens on the client
  }

  return (
    <NotFoundContainer>
      {notFound ? (
        <NotFoundWrapper>
          <NotFoundIllu statusCode={404} alt="A lost traveller" />
        </NotFoundWrapper>
      ) : (
        <ErrorWrapper>
          <NotFoundIllu statusCode={500} alt="Woodpecker and broken pencil" />
        </ErrorWrapper>
      )}
      <NotFoundTextContainer>
        <NotFoundTitle data-testid="error-title">{statusCode}</NotFoundTitle>
        <NotFoundSubTitle data-testid="error-sub-title">
          {errorMessage
            ? errorMessage
            : notFound
            ? 'The page could not be found'
            : 'An error has occured'}
        </NotFoundSubTitle>
        <NotFoundText>
          {notFound
            ? 'It seems that you got lost into the Sigleverse.'
            : `Oops! It seems that Sigle has stopped working. Please refresh the page or try again later`}
        </NotFoundText>
        {err && (
          <NotFoundText data-testid="error-id">{`Error ID: ${fakeId}`}</NotFoundText>
        )}
        {notFound ? (
          <Link href="/login" passHref>
            <NotFoundButton size="lg" color="orange">
              {user ? 'Go back to your dashboard' : 'Log in'}
            </NotFoundButton>
          </Link>
        ) : (
          <Link href="/" passHref>
            <Button
              onClick={() => window.location.reload()}
              size="lg"
              color="orange"
            >
              Refresh the page
            </Button>
          </Link>
        )}
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
