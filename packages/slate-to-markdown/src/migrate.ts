/**
 * Inspired by https://gist.github.com/webel/545f229fe79c2176dbaed9023de46e12
 *
 * Slate's schema has changed vastly under 2 years. The text editor is still
 * a better candidate than the other OSS editors out there, so we must live
 * with the major changes.
 *
 * Migrate a schema from the old version 0.33 to current version 0.6x
 * Inspiration taken wholly from
 * https://github.com/react-page/react-page/blob/b6c83a8650cfe9089e0c3eaf471ab58a0f7db761/packages/plugins/content/slate/src/migrations/v004.ts
 */

const migrateTextNode = (oldNode: any) => {
  const leaves = {
    text: oldNode.text,
    ...oldNode.marks?.reduce(
      (acc: any, mark: any) => ({
        ...acc,
        [mark.type === 'underlined' ? 'strikeThrough' : mark.type]: true,
      }),
      {}
    ),
  };
  return leaves;
};

const migrateLinkNode = (node: any) => {
  return {
    link: node.data.href,
    type: node.type,
    children: node.nodes?.map(migrateNode).flat() ?? [],
  };
};

const migrateImageNode = (node: any) => {
  return {
    link: node.data.src,
    caption: '',
    type: node.type,
    children: [],
  };
};

// List items needs to be wrapped in a paragraph
const migrateListItemNode = (node: any) => {
  return {
    data: node.data ?? {},
    type: 'list_item',
    children: [
      {
        type: 'paragraph',
        children: node.nodes?.map(migrateNode).flat() ?? [],
      },
    ],
  };
};

const migrateElementNode = (node: any) => {
  return {
    data: node.data ?? {},
    type: node.type,
    children: node.nodes?.map(migrateNode).flat() ?? [],
  };
};

const migrateNode = (oldNode: any) => {
  if (oldNode.object === 'text') {
    return migrateTextNode(oldNode);
  } else if (oldNode.object === 'inline' && oldNode.type === 'link') {
    return migrateLinkNode(oldNode);
  } else if (oldNode.object === 'block' && oldNode.type === 'image') {
    return migrateImageNode(oldNode);
  } else if (oldNode.object === 'block' && oldNode.type === 'list-item') {
    return migrateListItemNode(oldNode);
  } else {
    return migrateElementNode(oldNode);
  }
};

export const migrateSchema = (oldSchema: any) => {
  return oldSchema.document.nodes.map(migrateNode);
};
