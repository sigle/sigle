import React, { useState, useMemo, useCallback } from 'react';
import styled, { css } from 'styled-components';
import tw from 'twin.macro';
import {
  Editable,
  RenderElementProps,
  RenderLeafProps,
  withReact,
  Slate,
  ReactEditor,
  useSelected,
  useFocused,
} from 'slate-react';
import { Editor, Transforms, createEditor, Node } from 'slate';
import { withHistory } from 'slate-history';
import isHotkey from 'is-hotkey';
import Tooltip from '@reach/tooltip';
import { StateEditorHoverToolbar } from './StateEditorHoverToolbar';
import { SlateEditorLink } from './SlateEditorLink';
import { wrapLink } from './plugins/link/utils';

const StyledTooltip = styled(Tooltip)`
  pointer-events: unset;
`;

const Image = styled.img<{ selected?: boolean; isUploading?: boolean }>`
  ${tw`opacity-100 block transition-opacity duration-700`};
  max-width: 100%;
  max-height: 20em;
  box-shadow: ${(props) => (props.selected ? '0 0 0 1px #000000;' : 'none')};

  ${(props) =>
    props.isUploading &&
    css`
      ${tw`opacity-25`};
    `}
`;

const initialValue = [
  {
    type: 'paragraph',
    children: [
      { text: 'This is editable ' },
      { text: 'rich', bold: true },
      { text: ' text, ' },
      { text: 'much', italic: true },
      { text: ' better than a ' },
      { text: '<textarea>', code: true },
      { text: '!' },
    ],
  },
  {
    type: 'paragraph',
    children: [
      {
        text:
          "Since it's rich text, you can do things like turn a selection of text ",
      },
      { text: 'bold', bold: true },
      {
        text:
          ', or add a semantically rendered block quote in the middle of the page, like this:',
      },
    ],
  },
  {
    type: 'block-quote',
    children: [{ text: 'A wise quote.' }],
  },
  {
    type: 'paragraph',
    children: [{ text: 'Try it out for yourself!' }],
  },
];

const HOTKEYS = {
  'mod+b': 'bold',
  'mod+i': 'italic',
  'mod+u': 'underline',
  'mod+`': 'code',
};

const ImageElement = ({
  attributes,
  children,
  element,
}: RenderElementProps) => {
  const selected = useSelected();
  const focused = useFocused();

  const src = element.src as string;

  return <Image {...attributes} src={src} selected={selected && focused} />;
};

const Element = ({
  attributes,
  children,
  element,
  ...props
}: RenderElementProps) => {
  switch (element.type) {
    case 'block-quote':
      return <blockquote {...attributes}>{children}</blockquote>;
    case 'bulleted-list':
      return <ul {...attributes}>{children}</ul>;
    case 'heading-one':
      return <h1 {...attributes}>{children}</h1>;
    case 'heading-two':
      return <h2 {...attributes}>{children}</h2>;
    case 'heading-three':
      return <h3 {...attributes}>{children}</h3>;
    case 'list-item':
      return <li {...attributes}>{children}</li>;
    case 'numbered-list':
      return <ol {...attributes}>{children}</ol>;
    case 'link':
      const href = element.href as string;
      return (
        <span>
          <StyledTooltip
            label={
              <a href={href} target="_blank" rel="noopener noreferrer">
                {href}
              </a>
            }
          >
            <a {...attributes} href={href}>
              {children}
            </a>
          </StyledTooltip>
        </span>
      );
    case 'image':
      const src = element.src as string;
      // const id = node.data.get('id');
      // const isUploading = node.data.get('isUploading');
      return (
        <ImageElement
          {...props}
          attributes={attributes}
          children={children}
          element={element}
          // src={src}
          // selected={isFocused}
          // isUploading={isUploading}
          // id={`image-${id}`}
        />
      );
      return <p {...attributes}>Image</p>;
    default:
      return <p {...attributes}>{children}</p>;
  }
};

const Leaf = ({ attributes, children, leaf }: RenderLeafProps) => {
  if (leaf.bold) {
    children = <strong>{children}</strong>;
  }
  if (leaf.code) {
    children = <code>{children}</code>;
  }
  if (leaf.italic) {
    children = <em>{children}</em>;
  }
  if (leaf.underline) {
    children = <u>{children}</u>;
  }
  return <span {...attributes}>{children}</span>;
};

const toggleMark = (editor: ReactEditor, format: string) => {
  const isActive = isMarkActive(editor, format);

  if (isActive) {
    Editor.removeMark(editor, format);
  } else {
    Editor.addMark(editor, format, true);
  }
};

const isMarkActive = (editor: ReactEditor, format: string) => {
  const marks = Editor.marks(editor);
  return marks ? marks[format] === true : false;
};

interface NewEditorProps {
  // TODO type content
  content?: any;
}

// TODO change name of the component
export const NewEditor = ({ content }: NewEditorProps) => {
  const editor = useMemo(() => withHistory(withReact(createEditor())), []);
  const [value, setValue] = useState<Node[]>(() =>
    content ? content : initialValue
  );
  const [editLinkOpen, setEditLinkOpen] = useState(false);
  const renderElement = useCallback((props) => <Element {...props} />, []);
  const renderLeaf = useCallback((props) => <Leaf {...props} />, []);

  console.log('transformed content', content, value);

  const handleEditLink = () => {
    setEditLinkOpen(true);
  };

  // TODO onPaste for links see https://github.com/ianstormtaylor/slate/blob/master/examples/links/index.js
  const handleConfirmEditLink = (values: { text: string; link: string }) => {
    setEditLinkOpen(false);
    wrapLink(editor, values.link);
  };

  return (
    <Slate editor={editor} value={value} onChange={(value) => setValue(value)}>
      <StateEditorHoverToolbar onEditLink={handleEditLink} />

      <SlateEditorLink
        open={editLinkOpen}
        onClose={() => setEditLinkOpen(false)}
        onConfirmEditLink={handleConfirmEditLink}
      />

      <Editable
        renderElement={renderElement}
        renderLeaf={renderLeaf}
        placeholder="Enter some rich text…"
        spellCheck
        autoFocus
        onKeyDown={(event) => {
          for (const hotkey in HOTKEYS) {
            if (isHotkey(hotkey, event as any)) {
              event.preventDefault();
              // @ts-ignore
              const mark = HOTKEYS[hotkey];
              toggleMark(editor, mark);
            }
          }
        }}
        onSelect={() => {
          // Currently autoscroll is broken in slate, see https://github.com/ianstormtaylor/slate/issues/3750
          /**
           * Chrome doesn't scroll at bottom of the page. This fixes that.
           */
          if (!(window as any).chrome) return;
          if (editor.selection == null) return;
          try {
            /**
             * Need a try/catch because sometimes you get an error like:
             *
             * Error: Cannot resolve a DOM node from Slate node: {"type":"p","children":[{"text":"","by":-1,"at":-1}]}
             */
            const domPoint = ReactEditor.toDOMPoint(
              editor,
              editor.selection.focus
            );
            const node = domPoint[0];
            if (node == null) return;
            const element = node.parentElement;
            if (element == null) return;
            element.scrollIntoView({ behavior: 'smooth', block: 'nearest' });
          } catch (e) {
            /**
             * Empty catch. Do nothing if there is an error.
             */
          }
        }}
      />
    </Slate>
  );
};
