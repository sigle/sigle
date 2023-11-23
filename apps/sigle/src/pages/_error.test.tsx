/* eslint-disable @typescript-eslint/no-explicit-any */
import React from 'react';
import { render } from '@testing-library/react';
import * as Sentry from '@sentry/nextjs';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { useSession } from 'next-auth/react';
import { MyError } from './_error.page';

jest.mock('@sentry/nextjs');
jest.mock('next-auth/react');

// eslint-disable-next-line @typescript-eslint/no-non-null-assertion
const getInitialProps = MyError.getInitialProps!;
const queryClient = new QueryClient();

describe('MyError', () => {
  it('should display statusCode in title', async () => {
    (useSession as jest.Mock).mockReturnValue({ status: 'unauthenticated' });
    const { getByTestId } = render(
      <QueryClientProvider client={queryClient}>
        <MyError statusCode={404} />
      </QueryClientProvider>,
    );

    expect(getByTestId('error-title')).toHaveTextContent('404');
  });

  it('should display errorMessage in sub title', async () => {
    (useSession as jest.Mock).mockReturnValue({ status: 'unauthenticated' });
    const { getByTestId } = render(
      <QueryClientProvider client={queryClient}>
        <MyError statusCode={404} errorMessage="Custom error message" />
      </QueryClientProvider>,
    );

    expect(getByTestId('error-sub-title')).toHaveTextContent(
      'Custom error message',
    );
  });
});

const params = {
  req: {},
  res: { statusCode: 404 },
  asPath: '/login',
};

describe('getInitialProps', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('should not report 404 errors to sentry', async () => {
    const res = await getInitialProps({
      ...params,
      res: { statusCode: 404 },
    } as any);
    expect(Sentry.captureException).not.toBeCalled();
    expect(res).toEqual({ statusCode: 404 });
  });

  it('should report server errors to sentry', async () => {
    const error = new Error('Server error');
    const res = await getInitialProps({
      ...params,
      res: { statusCode: 500 },
      err: error,
    } as any);
    expect(Sentry.captureException).toBeCalledWith(error);
    expect(res).toEqual({ hasGetInitialPropsRun: true, statusCode: 500 });
  });

  it('should report generic server error if no error passed down', async () => {
    const res = await getInitialProps({
      ...params,
      res: { statusCode: 500 },
    } as any);
    expect(Sentry.captureException).toBeCalledWith(
      new Error('_error.js getInitialProps missing data at path: /login'),
    );
    expect(res).toEqual({ hasGetInitialPropsRun: true, statusCode: 500 });
  });

  it('should report client errors to sentry', async () => {
    const error = new Error('Client error');
    (error as any).statusCode = 500;
    const res = await getInitialProps({
      ...params,
      req: undefined,
      res: undefined,
      err: error,
    } as any);
    expect(Sentry.captureException).toBeCalledWith(error);
    expect(res).toEqual({ hasGetInitialPropsRun: true, statusCode: 500 });
  });

  it('should report generic client error if no error passed down', async () => {
    const res = await getInitialProps({
      ...params,
      req: undefined,
      res: undefined,
    } as any);
    expect(Sentry.captureException).toBeCalledWith(
      new Error('_error.js getInitialProps missing data at path: /login'),
    );
    expect(res).toEqual({ hasGetInitialPropsRun: true, statusCode: 404 });
  });
});

describe('Sentry ID', () => {
  it('should display server error Sentry ID', async () => {
    (useSession as jest.Mock).mockReturnValue({ status: 'unauthenticated' });
    const sentryID = '737H3RJA3RRH237';
    const { getByTestId } = render(
      <QueryClientProvider client={queryClient}>
        <MyError
          sentryErrorId={sentryID}
          statusCode={500}
          errorMessage="Custom error message"
        />
      </QueryClientProvider>,
    );
    expect(getByTestId('error-id')).toBeInTheDocument();
    expect(getByTestId('error-id')).toHaveTextContent(/737H3RJA3RRH237/);
  });
});
