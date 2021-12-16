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

it('render underlined text', () => {
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
              text: 'underlined',
              marks: [
                {
                  object: 'mark',
                  type: 'underlined',
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

it('render all marks text', () => {
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
              text: 'bold, italic, underlined',
              marks: [
                {
                  object: 'mark',
                  type: 'bold',
                  data: {},
                },
                {
                  object: 'mark',
                  type: 'italic',
                  data: {},
                },
                {
                  object: 'mark',
                  type: 'underlined',
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

it('render code text', () => {
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
              text: 'code',
              marks: [
                {
                  object: 'mark',
                  type: 'code',
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
