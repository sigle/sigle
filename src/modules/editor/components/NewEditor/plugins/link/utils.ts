import { Editor, Range, Transforms } from 'slate';

export const isLinkActive = (editor: Editor) => {
  // @ts-ignore
  const [link] = Editor.nodes(editor, { match: (n) => n.type === 'link' });
  return !!link;
};
export const unwrapLink = (editor: Editor, at?: Range) => {
  Transforms.unwrapNodes(editor, { match: (n) => n.type === 'link', at });
};

export const wrapLink = (editor: Editor, href: string, at?: Range) => {
  unwrapLink(editor, at);

  // const link = {
  //   type: 'link',
  //   href,
  //   children: [],
  // };

  // Transforms.wrapNodes(editor, link, { split: true, at });
  // Transforms.collapse(editor, { edge: 'end' });
};
