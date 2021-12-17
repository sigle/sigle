import { serialize, defaultNodeTypes } from 'remark-slate';
import { migrateSchema } from './migrate';

export const convert = (value: any): string => {
  return migrateSchema(value)
    .map((v: any) =>
      serialize(v, {
        nodeTypes: {
          ...defaultNodeTypes,
          // TODO not working
          // delete_mark: 'underlined',
          block_quote: 'block-quote',
          ol_list: 'numbered-list',
          ul_list: 'bulleted-list',
          heading: {
            ...defaultNodeTypes.heading,
            '1': 'heading-one',
            '2': 'heading-two',
            '3': 'heading-three',
          },
        },
      })
    )
    .join('');
};
