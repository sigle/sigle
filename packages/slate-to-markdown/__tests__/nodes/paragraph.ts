import { convert } from '../../src';

it('render text', () => {
  const slateJSON = {
    object: 'value',
    document: {
      object: 'document',
      data: {},
      nodes: [
        {
          object: 'block',
          type: 'paragraph',
          data: {},
          nodes: [
            {
              object: 'text',
              text: 'Hello',
              marks: [],
            },
          ],
        },
      ],
    },
  };
  expect(convert(slateJSON)).toMatchSnapshot();
});

it('render bold text', () => {
  const slateJSON = {
    object: 'value',
    document: {
      object: 'document',
      data: {},
      nodes: [
        {
          object: 'block',
          type: 'paragraph',
          data: {},
          nodes: [
            {
              object: 'text',
              text: 'Hello ',
              marks: [],
            },
            {
              object: 'text',
              text: 'bold',
              marks: [
                {
                  object: 'mark',
                  type: 'bold',
                  data: {},
                },
              ],
            },
            {
              object: 'text',
              text: ' hello',
              marks: [],
            },
          ],
        },
      ],
    },
  };
  expect(convert(slateJSON)).toMatchSnapshot();
});

it('render italic text', () => {
  const slateJSON = {
    object: 'value',
    document: {
      object: 'document',
      data: {},
      nodes: [
        {
          object: 'block',
          type: 'paragraph',
          data: {},
          nodes: [
            {
              object: 'text',
              text: 'Hello ',
              marks: [],
            },
            {
              object: 'text',
              text: 'italic',
              marks: [
                {
                  object: 'mark',
                  type: 'italic',
                  data: {},
                },
              ],
            },
            {
              object: 'text',
              text: ' hello',
              marks: [],
            },
          ],
        },
      ],
    },
  };
  expect(convert(slateJSON)).toMatchSnapshot();
});
