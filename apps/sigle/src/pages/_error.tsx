import React from 'react';
import { NextPageContext } from 'next';
import NextError from 'next/error';
import Link from 'next/link';
import * as Sentry from '@sentry/nextjs';
import Image from 'next/legacy/image';
import { Button, Container, Flex, Heading, Text } from '../ui';
import { styled } from '../stitches.config';
import { useAuth } from '../modules/auth/AuthContext';
import { AppHeader } from '../components/layout/header/header';

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
}

export const MyError = ({ statusCode, errorMessage }: ErrorProps) => {
  const { user } = useAuth();
  const notFound = statusCode === 404;

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

MyError.getInitialProps = async (contextData: NextPageContext) => {
  if (contextData.res?.statusCode === 404) {
    // Opinionated: do not record an exception in Sentry for 404
    return { statusCode: 404 };
  }

  // In case this is running in a serverless function, await this in order to give Sentry
  // time to send the error before the lambda exits
  await Sentry.captureUnderscoreErrorException(contextData);

  // This will contain the status code of the response
  return NextError.getInitialProps(contextData);
};

export default MyError;
