import { convert } from '../../src';

it('render numbered list', () => {
  const slateJSON = {
    object: 'value',
    document: {
      object: 'document',
      data: {},
      nodes: [
        {
          object: 'block',
          type: 'numbered-list',
          data: {},
          nodes: [
            {
              object: 'block',
              type: 'list-item',
              data: {},
              nodes: [
                {
                  object: 'text',
                  text: 'List item 1',
                  marks: [],
                },
              ],
            },
            {
              object: 'block',
              type: 'list-item',
              data: {},
              nodes: [
                {
                  object: 'text',
                  text: 'List item 2',
                  marks: [],
                },
              ],
            },
          ],
        },
      ],
    },
  };
  expect(convert(slateJSON)).toMatchSnapshot();
});

it('render bullet list', () => {
  const slateJSON = {
    object: 'value',
    document: {
      object: 'document',
      data: {},
      nodes: [
        {
          object: 'block',
          type: 'bulleted-list',
          data: {},
          nodes: [
            {
              object: 'block',
              type: 'list-item',
              data: {},
              nodes: [
                {
                  object: 'text',
                  text: 'List item 1',
                  marks: [],
                },
              ],
            },
            {
              object: 'block',
              type: 'list-item',
              data: {},
              nodes: [
                {
                  object: 'text',
                  text: 'List item 2',
                  marks: [],
                },
              ],
            },
          ],
        },
      ],
    },
  };
  expect(convert(slateJSON)).toMatchSnapshot();
});
