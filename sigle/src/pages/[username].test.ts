/**
 * @jest-environment node
 */

/* eslint-disable @typescript-eslint/no-explicit-any */
import * as Sentry from '@sentry/nextjs';
import { getServerSideProps } from './[username].page';

jest.mock('@sentry/nextjs');

describe('getServerSideProps', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('should return 404 when user is not found', async () => {
    const data = await getServerSideProps({
      params: { username: 'usernameTest' },
      req: { headers: {} },
      res: {},
    } as any);
    expect(Sentry.captureException).not.toBeCalled();
    if (!('props' in data)) {
      throw new Error('Test failed');
    }
    expect(data.props.statusCode).toBe(404);
    expect(data.props.errorMessage).toBeNull();
  });

  it('should return info', async () => {
    const data = await getServerSideProps({
      params: { username: 'leopradel.id.blockstack' },
      req: { headers: {} },
      res: {},
    } as any);
    if (!('props' in data)) {
      throw new Error('Test failed');
    }
    expect(data.props.statusCode).toBe(false);
    expect(data.props.errorMessage).toBeNull();
    expect(data.props.file).toBeTruthy();
    expect(data.props.settings).toBeTruthy();
    expect(data.props.userInfo).toBeTruthy();
  });
});
