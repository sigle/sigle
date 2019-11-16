import React, { forwardRef, useState } from 'react';
import { Editor } from 'slate-react';
import ReactDOM from 'react-dom';
import styled, { css } from 'styled-components';
import tw from 'tailwind.macro';
import {
  MdFormatBold,
  MdFormatItalic,
  MdFormatUnderlined,
} from 'react-icons/md';
import { SlateMarkButton } from './SlateMarkButton';

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
    const [open, setOpen] = useState(false);

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
      </HoverMenuContainer>,
      root
    );
  }
);

SlateEditorHoverMenu.displayName = 'SlateEditorHoverMenu';
