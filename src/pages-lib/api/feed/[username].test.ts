/* eslint-disable @typescript-eslint/no-explicit-any */
import parser from 'fast-xml-parser';
import { apiFeed } from './[username]';

jest.mock('@sentry/node');
// TODO see why this line is needed, looks like a bug in jest
jest.unmock('blockstack');

describe('test feed api', () => {
  it('should work properly', async () => {
    const req = {
      headers: {
        'x-forwarded-proto': 'https',
        'x-forwarded-host': 'app.sigle.io',
      },
      query: { username: 'sigleapp.id.blockstack' },
    };
    const res = {
      end: jest.fn(),
    };
    await apiFeed(req as any, res as any);

    const jsonObj = parser.parse(res.end.mock.calls[0][0]);
    expect(jsonObj.rss.channel).toEqual({
      copyright: 'All rights reserved 2020, sigleapp.id.blockstack',
      description: expect.stringContaining('official blog of Sigle'),
      docs: expect.any(String),
      generator: expect.any(String),
      item: expect.any(Array),
      lastBuildDate: expect.any(String),
      link: 'https://app.sigle.io/sigleapp.id.blockstack',
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
