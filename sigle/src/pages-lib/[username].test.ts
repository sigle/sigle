/* eslint-disable @typescript-eslint/no-explicit-any */
import { lookupProfile } from '@stacks/auth';
import * as Sentry from '@sentry/nextjs';
import { getServerSideProps } from './[username]';

jest.mock('@stacks/auth');
jest.mock('@sentry/nextjs');

const params = {
  params: { username: 'usernameTest' },
  req: { headers: {} },
  res: {},
};

describe('getServerSideProps', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('should return 500 if lookupProfile throw an error', async () => {
    const error = new Error('lookupProfile error message');
    (lookupProfile as jest.Mock).mockRejectedValueOnce(error);
    const data = await getServerSideProps(params as any);
    expect(lookupProfile).toBeCalledWith({ username: params.params.username });
    expect(Sentry.captureException).toBeCalledWith(error);
    // Used for typechecking
    if (!('props' in data)) {
      throw new Error('Test failed');
    }
    expect(data.props.statusCode).toBe(500);
    expect(data.props.errorMessage).toBe(
      `Blockstack lookupProfile returned error: ${error.message}`
    );
  });

  it('should return 404 if lookupProfile throw a name not found error', async () => {
    (lookupProfile as jest.Mock).mockRejectedValueOnce(
      new Error('Name not found')
    );
    const data = await getServerSideProps(params as any);
    expect(lookupProfile).toBeCalledWith({ username: params.params.username });
    expect(Sentry.captureException).not.toBeCalled();
    if (!('props' in data)) {
      throw new Error('Test failed');
    }
    expect(data.props.statusCode).toBe(404);
    expect(data.props.errorMessage).toBeNull();
  });

  it('should return 404 if app not found on the user apps', async () => {
    const data = await getServerSideProps(params as any);
    expect(lookupProfile).toBeCalledWith({ username: params.params.username });
    expect(Sentry.captureException).not.toBeCalled();
    if (!('props' in data)) {
      throw new Error('Test failed');
    }
    expect(data.props.statusCode).toBe(404);
    expect(data.props.errorMessage).toBeNull();
  });
});
