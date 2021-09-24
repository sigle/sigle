/* eslint-disable @typescript-eslint/no-explicit-any */
import React from 'react';
import { render } from '@testing-library/react';
import * as Sentry from '@sentry/nextjs';
import { MyError } from './_error';

jest.mock('@sentry/nextjs');

// eslint-disable-next-line @typescript-eslint/no-non-null-assertion
const getInitialProps = MyError.getInitialProps!;

describe('MyError', () => {
  it('should display statusCode in title', async () => {
    const { getByTestId } = render(<MyError statusCode={404} />);

    expect(getByTestId('error-title')).toHaveTextContent('404');
  });

  it('should display errorMessage in sub title', async () => {
    const { getByTestId } = render(
      <MyError statusCode={404} errorMessage="Custom error message" />
    );

    expect(getByTestId('error-sub-title')).toHaveTextContent(
      'Custom error message'
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
      new Error('_error.js getInitialProps missing data at path: /login')
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
      new Error('_error.js getInitialProps missing data at path: /login')
    );
    expect(res).toEqual({ hasGetInitialPropsRun: true, statusCode: 404 });
  });
});
