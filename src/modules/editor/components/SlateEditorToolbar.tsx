import React, { useRef } from 'react';
import styled, { css } from 'styled-components';
import tw from 'twin.macro';
import { Value } from 'slate';
import { Editor } from 'slate-react';
import { IconType } from 'react-icons';
import {
  hasLinks,
  unwrapLink,
  wrapLink,
  hasMark,
  hasBlock,
  DEFAULT_NODE,
} from './utils';
import { config } from '../../../config';
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
  MdSettings,
  MdImage,
  MdCode,
} from 'react-icons/md';
import { ButtonOutline } from '../../../components';

const SlateToolbar = styled.div`
  ${tw`py-4 border-b border-solid border-grey flex z-10 bg-white sticky flex justify-between max-w-full overflow-auto md:hidden`};
  top: 0;

  @media (min-width: ${config.breakpoints.md}px) {
    ${tw`overflow-visible`};
  }
`;

const SlateToolbarButtonContainer = styled.div`
  ${tw`flex`};
`;

const SlateEditorToolbarButton = styled.button<{ active: boolean }>`
  ${tw`py-2 px-2 outline-none flex text-grey-dark`};

  ${(props) =>
    props.active &&
    css`
      ${tw`text-black`};
    `}
`;

const SlateToolbarActionContainer = styled.div`
  ${tw`flex items-center`};
`;

const SlateToolbarActionIcon = styled.div`
  ${tw`p-2 -mr-2 flex items-center cursor-pointer text-pink`};
`;

export const onClickMark = (editor: Editor, type: string) => {
  editor.toggleMark(type);
};

export const onClickBlock = (editor: Editor, type: string) => {
  const { value } = editor;
  const { document } = value;

  // Handle everything but list buttons.
  if (type !== 'bulleted-list' && type !== 'numbered-list') {
    const isActive = hasBlock(value, type);
    const isList = hasBlock(value, 'list-item');

    if (isList) {
      editor
        .setBlocks(isActive ? DEFAULT_NODE : type)
        .unwrapBlock('bulleted-list')
        .unwrapBlock('numbered-list');
    } else {
      editor.setBlocks(isActive ? DEFAULT_NODE : type);
    }
  } else {
    // Handle the extra wrapping required for list buttons.
    const isList = hasBlock(value, 'list-item');
    const isType = value.blocks.some((block: any) => {
      return !!document.getClosest(
        block.key,
        (parent: any) => parent.type === type
      );
    });

    if (isList && isType) {
      editor
        .setBlocks(DEFAULT_NODE)
        .unwrapBlock('bulleted-list')
        .unwrapBlock('numbered-list');
    } else if (isList) {
      editor
        .unwrapBlock(
          type === 'bulleted-list' ? 'numbered-list' : 'bulleted-list'
        )
        .wrapBlock(type);
    } else {
      editor.setBlocks('list-item').wrapBlock(type);
    }
  }
};

interface SlateEditorToolbarProps {
  editor: Editor;
  value: Value;
  loadingSave: boolean;
  addImageToEditor: (editor: Editor, files: File[], target?: any) => void;
  handleOpenSettings: () => void;
  handleSave: () => void;
  onEditLink: () => void;
}

export const SlateEditorToolbar = ({
  editor,
  value,
  loadingSave,
  handleOpenSettings,
  handleSave,
  addImageToEditor,
  onEditLink,
}: SlateEditorToolbarProps) => {
  const fileUploaderRef = useRef<HTMLInputElement>(null);

  /**
   * Render a mark-toggling toolbar button.
   */
  const renderMarkButton = (type: string, Icon: IconType) => {
    const isActive = hasMark(value, type);

    return (
      <SlateEditorToolbarButton
        active={isActive}
        onMouseDown={(event) => {
          event.preventDefault();
          onClickMark(editor, type);
        }}
      >
        <Icon size={18} />
      </SlateEditorToolbarButton>
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
      <SlateEditorToolbarButton
        active={isActive}
        onMouseDown={(event) => {
          event.preventDefault();
          onClickBlock(editor, type);
        }}
      >
        <Icon size={18} />
      </SlateEditorToolbarButton>
    );
  };

  /**
   * Render a link toolbar button.
   */
  const renderLinkButton = () => {
    const isActive = hasLinks(value);

    return (
      <SlateEditorToolbarButton
        active={isActive}
        onMouseDown={(event) => {
          event.preventDefault();
          onEditLink();
        }}
      >
        <MdLink size={18} />
      </SlateEditorToolbarButton>
    );
  };

  return (
    <SlateToolbar>
      <SlateToolbarButtonContainer>
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
        <SlateEditorToolbarButton
          active={false}
          onMouseDown={(event) => {
            event.preventDefault();
            fileUploaderRef.current && fileUploaderRef.current.click();
          }}
        >
          <input
            type="file"
            accept="image/jpeg, image/png"
            onChange={(event) =>
              addImageToEditor(editor, event.target.files as any)
            }
            ref={fileUploaderRef}
            style={{ display: 'none' }}
          />
          <MdImage color={'#b8c2cc'} size={18} />
        </SlateEditorToolbarButton>
      </SlateToolbarButtonContainer>
      <SlateToolbarActionContainer>
        {loadingSave && (
          <ButtonOutline style={{ marginRight: 6 }} disabled>
            Saving ...
          </ButtonOutline>
        )}
        {!loadingSave && (
          <ButtonOutline
            style={{ marginRight: 6 }}
            onClick={() => handleSave()}
          >
            Save
          </ButtonOutline>
        )}
        <SlateToolbarActionIcon onClick={handleOpenSettings}>
          <MdSettings size={22} />
        </SlateToolbarActionIcon>
      </SlateToolbarActionContainer>
    </SlateToolbar>
  );
};
