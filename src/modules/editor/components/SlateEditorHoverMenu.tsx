import React, { forwardRef } from 'react';
import { Editor } from 'slate-react';
import { IconType } from 'react-icons';
import ReactDOM from 'react-dom';
import styled, { css } from 'styled-components';
import tw from 'twin.macro';
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
import { hasLinks, hasBlock, hasMark } from './utils';
import { onClickLink, onClickBlock, onClickMark } from './SlateEditorToolbar';

const HoverMenuContainer = styled.div`
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

const SlateEditorHoverMenuButton = styled.button<{ active: boolean }>`
  ${tw`text-white cursor-pointer`};
  padding-left: 0.3rem;
  padding-right: 0.3rem;

  ${props =>
    props.active &&
    css`
      ${tw`text-pink`};
    `}
`;

interface SlateEditorSideMenuProps {
  editor: Editor;
}

export const SlateEditorHoverMenu = forwardRef(
  ({ editor }: SlateEditorSideMenuProps, ref: any) => {
    const root = window.document.getElementById('__next');
    if (!root) return null;

    const { value } = editor;

    /**
     * Render a mark-toggling toolbar button.
     */
    const renderMarkButton = (type: string, Icon: IconType) => {
      const isActive = hasMark(value, type);

      return (
        <SlateEditorHoverMenuButton
          active={isActive}
          onMouseDown={event => {
            event.preventDefault();
            onClickMark(editor, type);
          }}
        >
          <Icon size={18} />
        </SlateEditorHoverMenuButton>
      );
    };

    /**
     * Render a block-toggling toolbar button.
     */
    const renderBlockButton = (type: string, Icon: IconType) => {
      let isActive = hasBlock(value, type);

      if (['numbered-list', 'bulleted-list'].includes(type)) {
        const { document, blocks } = value;

        if (blocks.size > 0) {
          const parent = document.getParent(blocks.first().key);
          isActive =
            hasBlock(value, 'list-item') &&
            !!parent &&
            (parent as any).type === type;
        }
      }

      return (
        <SlateEditorHoverMenuButton
          active={isActive}
          onMouseDown={event => {
            event.preventDefault();
            onClickBlock(editor, type);
          }}
        >
          <Icon size={18} />
        </SlateEditorHoverMenuButton>
      );
    };

    /**
     * Render a link toolbar button.
     */
    const renderLinkButton = () => {
      const isActive = hasLinks(value);

      return (
        <SlateEditorHoverMenuButton
          active={isActive}
          onMouseDown={event => {
            event.preventDefault();
            onClickLink(editor);
          }}
        >
          <MdLink size={18} />
        </SlateEditorHoverMenuButton>
      );
    };

    return ReactDOM.createPortal(
      <HoverMenuContainer ref={ref}>
        {renderMarkButton('bold', MdFormatBold)}
        {renderMarkButton('italic', MdFormatItalic)}
        {renderMarkButton('underlined', MdFormatUnderlined)}
        {renderMarkButton('code', MdCode)}
        {renderBlockButton('block-quote', MdFormatQuote)}
        {renderBlockButton('heading-one', MdLooksOne)}
        {renderBlockButton('heading-two', MdLooksTwo)}
        {renderBlockButton('heading-three', MdLooks3)}
        {renderBlockButton('numbered-list', MdFormatListNumbered)}
        {renderBlockButton('bulleted-list', MdFormatListBulleted)}
        {renderLinkButton()}
      </HoverMenuContainer>,
      root
    );
  }
);

SlateEditorHoverMenu.displayName = 'SlateEditorHoverMenu';
