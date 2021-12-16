import { convert } from '../src/index';

describe('markdown', () => {
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

  it('render link', () => {
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
                text: '',
                marks: [],
              },
              {
                object: 'inline',
                type: 'link',
                data: {
                  href: 'https://www.sigle.io',
                },
                nodes: [
                  {
                    object: 'text',
                    text: 'sigle',
                    marks: [],
                  },
                ],
              },
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
});
