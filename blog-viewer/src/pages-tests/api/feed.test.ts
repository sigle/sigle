/* eslint-disable @typescript-eslint/no-explicit-any */
import parser from 'fast-xml-parser';
import apiFeed from '../../pages/api/feed';
import { prismaClient } from '../../utils/prisma';

jest.mock('@sentry/node');
jest.mock('../../utils/prisma', () => {
  return {
    prismaClient: {
      user: {
        findUnique: jest.fn(),
      },
    },
  };
});

describe('test feed api', () => {
  beforeAll(() => {
    process.env = Object.assign(process.env, {
      APP_URL: 'https://app.sigle.io',
    });
  });

  it('should throw 404 error if username not found', async () => {
    const req = {
      headers: {
        'x-forwarded-proto': 'https',
        host: 'doesnotexist.sigle.io',
      },
    };
    const res = {
      statusCode: 200,
      end: jest.fn(),
    };
    await apiFeed(req as any, res as any);

    expect(res.statusCode).toBe(404);
    expect(res.end).toHaveBeenCalledWith('404 not found');
  });

  it('should work properly', async () => {
    (prismaClient.user.findUnique as jest.Mock).mockResolvedValueOnce({
      username: 'sigleapp.id.blockstack',
    });
    const req = {
      headers: {
        'x-forwarded-proto': 'https',
        host: 'blog.sigle.io',
      },
    };
    const res = {
      end: jest.fn(),
    };
    await apiFeed(req as any, res as any);

    expect(res.end).toBeCalled();
    const jsonObj = parser.parse(res.end.mock.calls[0][0]);
    expect(jsonObj.rss.channel).toEqual({
      copyright: 'All rights reserved 2021, sigleapp.id.blockstack',
      description: expect.stringContaining('official blog of Sigle'),
      docs: expect.any(String),
      generator: expect.any(String),
      item: expect.any(Array),
      lastBuildDate: expect.any(String),
      link: 'https://blog.sigle.io',
      title: 'Sigle | The blog',
    });
    // Last items should never change
    expect(
      jsonObj.rss.channel.item[jsonObj.rss.channel.item.length - 1]
    ).toMatchSnapshot();
    expect(
      jsonObj.rss.channel.item[jsonObj.rss.channel.item.length - 2]
    ).toMatchSnapshot();
  });
});
