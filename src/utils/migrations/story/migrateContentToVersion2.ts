import isEmpty from 'lodash.isempty';

/**
 * Migrate the data from Slate 0.47.9 to 0.59
 * Inspired by https://github.com/react-page/react-page/blob/v1.0.0-beta.8/packages/plugins/content/slate/src/migrations/v004.ts
 */

type OldMark = {
  object: 'mark';
  type: string;
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  data?: { [key: string]: any };
};

type OldTextNode = {
  object: 'text';
  text: string;
  marks?: OldMark[];
};

type OldElementNode = {
  object: 'block' | 'inline';
  type: string;
  isVoid: boolean;
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  data: { [key: string]: any };
  nodes: OldNode[];
};

type OldNode = OldElementNode | OldTextNode;

const migrateTextNode = (oldNode: OldTextNode) => {
  return {
    text: oldNode.text,
    ...(oldNode.marks?.reduce(
      (acc, mark) => ({
        ...acc,
        [mark.type]: !isEmpty(mark.data) ? mark.data : true,
      }),
      {}
    ) ?? {}),
  };
};

// eslint-disable-next-line @typescript-eslint/no-explicit-any
const migrateElementNode = (node: OldElementNode): any => {
  return {
    ...(node.data ?? {}),
    type: node.type,
    children: node.nodes?.map(migrateNode) ?? [],
  };
};

const migrateNode = (oldNode: OldNode) => {
  if (oldNode.object === 'text') {
    return migrateTextNode(oldNode);
  } else {
    return migrateElementNode(oldNode);
  }
};

export const migrateContentToVersion2 = (content: any) => {
  if (!content) {
    return {};
  }

  return content.document?.nodes?.map(migrateNode) ?? [];
};
