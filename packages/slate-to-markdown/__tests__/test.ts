import { convert } from '../src/index';

describe('test', () => {
  it('works', () => {
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
});
