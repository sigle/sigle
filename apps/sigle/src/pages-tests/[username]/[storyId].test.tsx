/**
 * @jest-environment node
 */

/* eslint-disable @typescript-eslint/no-explicit-any */
import * as Sentry from '@sentry/nextjs';
import { getServerSideProps } from '../../pages/[username]/[storyId]';

jest.mock('@sentry/nextjs');
jest.mock('../../modules/publicStory/PublicStory', () => null);

describe('getServerSideProps', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('should return 404 if lookupProfile throw a name not found error', async () => {
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
      params: {
        username: 'sigle.btc',
        storyId: 'FRNv_3Lpup1CHZtGUDPOh',
      },
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
