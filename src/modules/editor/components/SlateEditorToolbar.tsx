import React from 'react';
import styled from 'styled-components';
import tw from 'tailwind.macro';
import { Editor } from 'slate-react';
import { hasLinks, unwrapLink, wrapLink, insertImage } from './utils';
import {
  MarkButtonProps,
  StyledMarButton,
  SlateMarkButton,
} from './SlateMarkButton';
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
} from 'react-icons/md';
import { SlateBlockButton } from './SlateBlockButton';
import { SlateLinkButton } from './SlateLinkButton';
import { ButtonOutline } from '../../../components';

const SlateToolbar = styled.div`
  ${tw`py-4 border-b border-solid border-grey flex z-10 bg-white sticky flex justify-between max-w-full overflow-auto`};
  top: 0;

  @media (min-width: ${config.breakpoints.md}px) {
    ${tw`overflow-visible`};
  }
`;

const SlateToolbarButtonContainer = styled.div`
  ${tw`flex`};
`;

const SlateToolbarButton = styled.button`
  ${tw`py-2 px-2 outline-none flex`};
`;

const SlateToolbarActionContainer = styled.div`
  ${tw`flex items-center`};
`;

const SlateToolbarActionIcon = styled.div`
  ${tw`p-2 -mr-2 flex items-center cursor-pointer text-pink`};
`;

interface SlateEditorToolbarProps {
  editor: Editor;
  loadingSave: boolean;
  onClickImage: (editor: Editor) => void;
  handleOpenSettings: () => void;
  handleSave: () => void;
}

export const SlateEditorToolbar = ({
  editor,
  loadingSave,
  onClickImage,
  handleOpenSettings,
  handleSave,
}: SlateEditorToolbarProps) => {
  return (
    <SlateToolbar>
      <SlateToolbarButtonContainer>
        <SlateMarkButton
          editor={editor}
          component="toolbar"
          type="bold"
          icon={MdFormatBold}
          iconSize={18}
        />
        <SlateMarkButton
          editor={editor}
          component="toolbar"
          type="italic"
          icon={MdFormatItalic}
          iconSize={18}
        />
        <SlateMarkButton
          editor={editor}
          component="toolbar"
          type="underlined"
          icon={MdFormatUnderlined}
          iconSize={18}
        />
        <SlateBlockButton
          editor={editor}
          component="toolbar"
          type="block-quote"
          icon={MdFormatQuote}
          iconSize={18}
        />
        <SlateBlockButton
          editor={editor}
          component="toolbar"
          type="heading-one"
          icon={MdLooksOne}
          iconSize={18}
        />
        <SlateBlockButton
          editor={editor}
          component="toolbar"
          type="heading-two"
          icon={MdLooksTwo}
          iconSize={18}
        />
        <SlateBlockButton
          editor={editor}
          component="toolbar"
          type="heading-three"
          icon={MdLooks3}
          iconSize={18}
        />
        <SlateBlockButton
          editor={editor}
          component="toolbar"
          type="numbered-list"
          icon={MdFormatListNumbered}
          iconSize={18}
        />
        <SlateBlockButton
          editor={editor}
          component="toolbar"
          type="bulleted-list"
          icon={MdFormatListBulleted}
          iconSize={18}
        />
        <SlateLinkButton
          editor={editor}
          component="toolbar"
          type="link"
          icon={MdLink}
          iconSize={18}
        />
        <SlateToolbarButton
          onMouseDown={event => {
            event.preventDefault();
            onClickImage(editor);
          }}
        >
          <MdImage color={'#b8c2cc'} size={18} />
        </SlateToolbarButton>
      </SlateToolbarButtonContainer>
      <SlateToolbarActionContainer>
        {loadingSave && (
          <ButtonOutline style={{ marginRight: 6 }} disabled>
            Saving ...
          </ButtonOutline>
        )}
        {!loadingSave && (
          <ButtonOutline style={{ marginRight: 6 }} onClick={handleSave}>
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
