import { convert } from '../../src';

it('render image', () => {
  const slateJSON = {
    object: 'value',
    document: {
      object: 'document',
      data: {},
      nodes: [
        {
          object: 'block',
          type: 'image',
          data: {
            src: 'https://gaia.blockstack.org/hub/18D2Jwi8xaF9k1natrajDSsg7gUmr3KQGw/photos/eEb-WTOLPe24j7x8pM5Mm/pWhvyVS2N1vYqHEnFHFxz-Leo.png',
            id: 'pWhvyVS2N1vYqHEnFHFxz',
          },
          nodes: [
            {
              object: 'text',
              text: '',
              marks: [],
            },
          ],
        },
      ],
    },
  };
  expect(convert(slateJSON)).toMatchSnapshot();
});
