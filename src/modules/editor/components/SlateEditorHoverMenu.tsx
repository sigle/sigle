import React, { forwardRef } from 'react';
import { Editor } from 'slate-react';
import ReactDOM from 'react-dom';
import styled from 'styled-components';
import tw from 'tailwind.macro';
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
} from 'react-icons/md';
import { SlateMarkButton } from './SlateMarkButton';
import { SlateBlockButton } from './SlateBlockButton';
import { SlateLinkButton } from './SlateLinkButton';

const HoverMenuContainer = styled.div`
  ${tw`flex`};
  padding: 8px 7px 6px;
  position: absolute;
  z-index: 1;
  top: -10000px;
  left: -10000px;
  margin-top: -6px;
  opacity: 0;
  background-color: #222;
  border-radius: 4px;
  transition: opacity 0.75s;
`;

interface SlateEditorSideMenuProps {
  editor: Editor;
}

export const SlateEditorHoverMenu = forwardRef(
  ({ editor }: SlateEditorSideMenuProps, ref: any) => {
    const root = window.document.getElementById('__next');
    if (!root) return null;

    return ReactDOM.createPortal(
      <HoverMenuContainer ref={ref}>
        <SlateMarkButton
          component="hover"
          editor={editor}
          type="bold"
          icon={MdFormatBold}
        />
        <SlateMarkButton
          component="hover"
          editor={editor}
          type="italic"
          icon={MdFormatItalic}
        />
        <SlateMarkButton
          component="hover"
          editor={editor}
          type="underlined"
          icon={MdFormatUnderlined}
        />
        <SlateBlockButton
          editor={editor}
          component="hover"
          type="block-quote"
          icon={MdFormatQuote}
          iconSize={18}
        />
        <SlateBlockButton
          editor={editor}
          component="hover"
          type="heading-one"
          icon={MdLooksOne}
          iconSize={18}
        />
        <SlateBlockButton
          editor={editor}
          component="hover"
          type="heading-two"
          icon={MdLooksTwo}
          iconSize={18}
        />
        <SlateBlockButton
          editor={editor}
          component="hover"
          type="heading-three"
          icon={MdLooks3}
          iconSize={18}
        />
        <SlateBlockButton
          editor={editor}
          component="hover"
          type="numbered-list"
          icon={MdFormatListNumbered}
          iconSize={18}
        />
        <SlateBlockButton
          editor={editor}
          component="hover"
          type="bulleted-list"
          icon={MdFormatListBulleted}
          iconSize={18}
        />
        <SlateLinkButton
          editor={editor}
          component="hover"
          type="link"
          icon={MdLink}
          iconSize={18}
        />
      </HoverMenuContainer>,
      root
    );
  }
);

SlateEditorHoverMenu.displayName = 'SlateEditorHoverMenu';
