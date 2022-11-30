import { ConfigService } from '@nestjs/config';
import { getToken } from 'next-auth/jwt';
import { AuthGuard } from './auth.guard';

jest.mock('next-auth/jwt');

describe('AuthGuard', () => {
  const OLD_ENV = process.env;

  beforeEach(() => {
    jest.resetModules(); // Most important - it clears the cache
    process.env = { ...OLD_ENV }; // Make a copy
  });

  afterAll(() => {
    process.env = OLD_ENV; // Restore old environment
  });

  it('should bypass next-auth check in test env', async () => {
    const context = {
      switchToHttp: jest.fn(() => ({
        getRequest: jest.fn().mockReturnValue({
          cookies: {
            'next-auth.session-token':
              'SP3VCX5NFQ8VCHFS9M6N40ZJNVTRT4HZ62WFH5C4Q',
          },
          headers: {},
        }),
      })),
    };
    const authGuard = new AuthGuard(new ConfigService());

    expect(await authGuard.canActivate(context as any)).toBeTruthy();
    expect(getToken).not.toBeCalled();
  });

  it('should return false with invalid token', async () => {
    // eslint-disable-next-line @typescript-eslint/ban-ts-comment
    // @ts-ignore
    process.env.NODE_ENV = 'development';
    const context = {
      switchToHttp: jest.fn(() => ({
        getRequest: jest.fn().mockReturnValue({
          cookies: {},
          headers: {},
          raw: {},
        }),
      })),
    };
    (getToken as jest.Mock).mockReturnValueOnce(false);
    const authGuard = new AuthGuard(new ConfigService());

    expect(await authGuard.canActivate(context as any)).toBeFalsy();
    expect(getToken).toBeCalled();
  });

  it('should return true with valid token', async () => {
    // eslint-disable-next-line @typescript-eslint/ban-ts-comment
    // @ts-ignore
    process.env.NODE_ENV = 'development';
    const context = {
      switchToHttp: jest.fn(() => ({
        getRequest: jest.fn().mockReturnValue({
          cookies: {},
          headers: {},
          raw: {},
        }),
      })),
    };
    (getToken as jest.Mock).mockReturnValueOnce({
      sub: 'SP3VCX5NFQ8VCHFS9M6N40ZJNVTRT4HZ62WFH5C4Q',
    });
    const authGuard = new AuthGuard(new ConfigService());

    expect(await authGuard.canActivate(context as any)).toBeTruthy();
    expect(getToken).toBeCalled();
  });
});
