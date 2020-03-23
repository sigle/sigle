/* eslint-disable @typescript-eslint/no-explicit-any */
import { lookupProfile } from 'blockstack';
import * as Sentry from '@sentry/node';
import PublicStoryPage from './[storyId]';

jest.mock('blockstack');
jest.mock('@sentry/node');

const params = {
  query: { username: 'usernameTest' },
  req: { headers: {} },
  res: {},
};

// eslint-disable-next-line @typescript-eslint/no-non-null-assertion
const getInitialProps = PublicStoryPage.getInitialProps!;

describe('getInitialProps', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('should return 500 if lookupProfile throw an error', async () => {
    const error = new Error('lookupProfile error message');
    (lookupProfile as jest.Mock).mockRejectedValueOnce(error);
    const res = await getInitialProps(params as any);
    expect(lookupProfile).toBeCalledWith(params.query.username);
    expect(Sentry.captureException).toBeCalledWith(error);
    expect(res.statusCode).toBe(500);
    expect(res.errorMessage).toBe(
      `Blockstack lookupProfile returned error: ${error.message}`
    );
  });

  it('should return 404 if lookupProfile throw a name not found error', async () => {
    (lookupProfile as jest.Mock).mockRejectedValueOnce(
      new Error('Name not found')
    );
    const res = await getInitialProps(params as any);
    expect(lookupProfile).toBeCalledWith(params.query.username);
    expect(Sentry.captureException).not.toBeCalled();
    expect(res.statusCode).toBe(404);
    expect(res.errorMessage).toBeUndefined();
  });

  it('should return 404 if app not found on the user apps', async () => {
    const res = await getInitialProps(params as any);
    expect(lookupProfile).toBeCalledWith(params.query.username);
    expect(Sentry.captureException).not.toBeCalled();
    expect(res.statusCode).toBe(404);
    expect(res.errorMessage).toBeUndefined();
  });
});
