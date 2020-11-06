import React, { useRef, useEffect } from 'react';
import ReactDOM from 'react-dom';
import { ReactEditor, useSlate } from 'slate-react';
import { Range, Editor, Transforms, Text } from 'slate';
import styled, { css } from 'styled-components';
import tw from 'twin.macro';
import { IconType } from 'react-icons';
import {
  MdFormatBold,
  MdFormatItalic,
  MdFormatUnderlined,
  MdFormatQuote,
  MdLooksOne,
  MdLooksTwo,
  MdLooks3,
  MdFormatListNumbered,
  MdFormatListBulleted,
  MdLink,
  MdCode,
} from 'react-icons/md';
import { isLinkActive } from './plugins/link/utils';

// TODO ? format type underlined renamed to underline

const LIST_TYPES = ['numbered-list', 'bulleted-list'];

const HoverToolbar = styled.div`
  ${tw`flex transition-opacity duration-700`};
  padding: 8px 7px 6px;
  position: absolute;
  z-index: 1;
  top: -10000px;
  left: -10000px;
  margin-top: -6px;
  opacity: 0;
  background-color: #222;
  border-radius: 4px;
`;

const StyledHoverToolbarButton = styled.button<{ active: boolean }>`
  ${tw`text-white cursor-pointer`};
  padding-left: 0.3rem;
  padding-right: 0.3rem;

  ${(props) =>
    props.active &&
    css`
      ${tw`text-pink`};
    `}
`;

const toggleFormat = (editor: Editor, format: string) => {
  const isActive = isFormatActive(editor, format);
  Transforms.setNodes(
    editor,
    { [format]: isActive ? null : true },
    { match: Text.isText, split: true }
  );
};

const toggleBlock = (editor: Editor, format: string) => {
  const isActive = isBlockActive(editor, format);
  const isList = LIST_TYPES.includes(format);

  Transforms.unwrapNodes(editor, {
    match: (n) => LIST_TYPES.includes(n.type as string),
    split: true,
  });

  Transforms.setNodes(editor, {
    type: isActive ? 'paragraph' : isList ? 'list-item' : format,
  });

  if (!isActive && isList) {
    const block = { type: format, children: [] };
    Transforms.wrapNodes(editor, block);
  }
};

const isFormatActive = (editor: Editor, format: string) => {
  // @ts-ignore
  const [match] = Editor.nodes(editor, {
    match: (n) => n[format] === true,
    mode: 'all',
  });
  return !!match;
};

const isBlockActive = (editor: Editor, format: string) => {
  // @ts-ignore
  const [match] = Editor.nodes(editor, {
    match: (n) => n.type === format,
  });

  return !!match;
};

interface HoverToolbarButtonProps {
  format: string;
  icon: IconType;
}

const HoverToolbarMarkButton = ({
  format,
  icon: Icon,
}: HoverToolbarButtonProps) => {
  const editor = useSlate();

  return (
    <StyledHoverToolbarButton
      active={isFormatActive(editor, format)}
      onMouseDown={(event) => {
        event.preventDefault();
        toggleFormat(editor, format);
      }}
    >
      <Icon size={18} />
    </StyledHoverToolbarButton>
  );
};

const HoverToolbarBlockButton = ({
  format,
  icon: Icon,
}: HoverToolbarButtonProps) => {
  const editor = useSlate();

  return (
    <StyledHoverToolbarButton
      active={isBlockActive(editor, format)}
      onMouseDown={(event) => {
        event.preventDefault();
        toggleBlock(editor, format);
      }}
    >
      <Icon size={18} />
    </StyledHoverToolbarButton>
  );
};

interface HoverToolbarLinkButtonProps {
  onEditLink: () => void;
}

const HoverToolbarLinkButton = ({
  onEditLink,
}: HoverToolbarLinkButtonProps) => {
  const editor = useSlate();

  return (
    <StyledHoverToolbarButton
      active={isLinkActive(editor)}
      onMouseDown={(event) => {
        event.preventDefault();
        onEditLink();
      }}
    >
      <MdLink size={18} />
    </StyledHoverToolbarButton>
  );
};

interface StateEditorHoverToolbarProps {
  onEditLink: () => void;
}

export const StateEditorHoverToolbar = ({
  onEditLink,
}: StateEditorHoverToolbarProps) => {
  const ref = useRef<HTMLDivElement>(null);
  const editor = useSlate();
  const root = window.document.getElementById('__next');

  useEffect(() => {
    const el = ref.current;
    const { selection } = editor;

    if (!el) {
      return;
    }

    if (
      !selection ||
      !ReactEditor.isFocused(editor) ||
      Range.isCollapsed(selection) ||
      Editor.string(editor, selection) === ''
    ) {
      el.removeAttribute('style');
      return;
    }

    const domSelection = window.getSelection();
    const domRange = domSelection!.getRangeAt(0);
    const rect = domRange.getBoundingClientRect();
    el.style.opacity = '1';
    el.style.top = `${rect.top + window.pageYOffset - el.offsetHeight}px`;
    el.style.left = `${
      rect.left + window.pageXOffset - el.offsetWidth / 2 + rect.width / 2
    }px`;
  });

  if (!root) {
    return null;
  }

  return ReactDOM.createPortal(
    <HoverToolbar ref={ref}>
      <HoverToolbarMarkButton format="bold" icon={MdFormatBold} />
      <HoverToolbarMarkButton format="italic" icon={MdFormatItalic} />
      <HoverToolbarMarkButton format="underline" icon={MdFormatUnderlined} />
      <HoverToolbarMarkButton format="code" icon={MdCode} />
      <HoverToolbarBlockButton format="block-quote" icon={MdFormatQuote} />
      <HoverToolbarBlockButton format="heading-one" icon={MdLooksOne} />
      <HoverToolbarBlockButton format="heading-two" icon={MdLooksTwo} />
      <HoverToolbarBlockButton format="heading-three" icon={MdLooks3} />
      <HoverToolbarBlockButton
        format="numbered-list"
        icon={MdFormatListNumbered}
      />
      <HoverToolbarBlockButton
        format="bulleted-list"
        icon={MdFormatListBulleted}
      />
      <HoverToolbarLinkButton onEditLink={onEditLink} />
    </HoverToolbar>,
    root
  );
};
