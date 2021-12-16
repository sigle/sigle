import { convert } from '../../src';

it('render blockquote', () => {
  const slateJSON = {
    object: 'value',
    document: {
      object: 'document',
      data: {},
      nodes: [
        {
          object: 'block',
          type: 'block-quote',
          data: {},
          nodes: [
            {
              object: 'text',
              text: 'Blockquote',
              marks: [],
            },
          ],
        },
      ],
    },
  };
  expect(convert(slateJSON)).toMatchSnapshot();
});
