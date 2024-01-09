/**
 * @jest-environment node
 */

/* eslint-disable @typescript-eslint/no-explicit-any */
import { XMLParser } from 'fast-xml-parser';
import { apiFeed } from '../../../pages/api/feed/[username]';

jest.mock('@sentry/nextjs');

describe('test feed api', () => {
  it('should throw 404 error if username not found', async () => {
    const req = {
      headers: {
        'x-forwarded-proto': 'https',
        'x-forwarded-host': 'app.sigle.io',
      },
      query: { username: 'sigleapp.id.doesnotexist' },
    };
    const res = {
      statusCode: 200,
      end: jest.fn(),
    };
    await apiFeed(req as any, res as any);

    expect(res.statusCode).toBe(404);
    expect(res.end).toHaveBeenCalledWith('sigleapp.id.doesnotexist not found');
  }, 20000);

  it('should work properly', async () => {
    const req = {
      headers: {
        'x-forwarded-proto': 'https',
        'x-forwarded-host': 'app.sigle.io',
      },
      query: { username: 'sigle.btc' },
    };
    const res = {
      end: jest.fn(),
    };
    await apiFeed(req as any, res as any);

    expect(res.end).toBeCalled();
    const parser = new XMLParser();
    const jsonObj = parser.parse(res.end.mock.calls[0][0]);
    expect(jsonObj.rss.channel).toEqual({
      copyright: 'All rights reserved 2024, sigle.btc',
      description: expect.stringContaining('Sigle'),
      docs: expect.any(String),
      generator: expect.any(String),
      item: expect.any(Array),
      lastBuildDate: expect.any(String),
      link: 'https://app.sigle.io/sigle.btc',
      title: 'Sigle',
    });
    // Last items should never change
    expect(
      jsonObj.rss.channel.item[jsonObj.rss.channel.item.length - 1],
    ).toMatchSnapshot();
    expect(
      jsonObj.rss.channel.item[jsonObj.rss.channel.item.length - 2],
    ).toMatchSnapshot();
  });
});
