import { useState } from 'react';
import { Editor, BubbleMenu as TipTapBubbleMenu } from '@tiptap/react';
import { isTextSelection } from '@tiptap/core';
import { globalCss, styled } from '../../stitches.config';
import { BubbleMenuItems } from './BubbleMenuItems';

// Tippyjs theme used by the bubble menu
const globalStylesCustomEditor = globalCss({
  ".tippy-box[data-theme~='sigle-editor-bubble-menu']": {
    backgroundColor: '$gray11',
  },
  ".tippy-box[data-theme~='sigle-editor-bubble-menu'][data-placement^='top'] > .tippy-arrow::before":
    {
      display: 'none',
      borderTopColor: '$gray11',
      '@xl': {
        display: 'block',
      },
    },
  ".tippy-box[data-theme~='sigle-editor-bubble-menu'][data-placement^='bottom'] > .tippy-arrow::before":
    {
      display: 'none',
      borderBottomColor: '$gray11',
      '@xl': {
        display: 'block',
      },
    },
  ".tippy-box[data-theme~='sigle-editor-bubble-menu'][data-placement^='left'] > .tippy-arrow::before":
    {
      display: 'none',
      borderLeftColor: '$gray11',
      '@xl': {
        display: 'block',
      },
    },
  ".tippy-box[data-theme~='sigle-editor-bubble-menu'][data-placement^='right'] > .tippy-arrow::before":
    {
      display: 'none',
      borderRightColor: '$gray11',
      '@xl': {
        display: 'block',
      },
    },
  ".tippy-box[data-theme~='sigle-editor-bubble-menu'] .tippy-content": {
    padding: 0,
    color: '$gray1',
  },
});

const StyledBubbleMenu = styled(TipTapBubbleMenu, {
  display: 'none',
  gap: '$3',
  br: '$1',
  py: '$3',
  px: '$4',

  '@xl': {
    display: 'flex',
  },
});

// Maybe can be used on clicks https://github.com/ueberdosis/tiptap/issues/104#issuecomment-912794709

interface BubbleMenuProps {
  editor: Editor;
  defaultOpen?: boolean;
}

export const BubbleMenu = ({
  editor,
  defaultOpen = false,
}: BubbleMenuProps) => {
  globalStylesCustomEditor();
  // const [linkState, setLinkState] = useState({ open: false, value: '' });

  // const resetLink = () => {
  //   setLinkState({
  //     open: false,
  //     value: '',
  //   });
  // };

  return (
    <StyledBubbleMenu
      tippyOptions={{
        duration: 100,
        theme: 'sigle-editor-bubble-menu',
        // onHidden: () => resetLink(),
      }}
      shouldShow={({ editor, state, from, to, view }) => {
        if (defaultOpen) {
          return true;
        }
        // Take the initial implementation of the plugin and extends it
        // https://github.com/ueberdosis/tiptap/blob/main/packages/extension-bubble-menu/src/bubble-menu-plugin.ts#L43
        const { doc, selection } = state;
        const { empty } = selection;
        // Sometime check for `empty` is not enough.
        // Doubleclick an empty paragraph returns a node size of 2.
        // So we check also for an empty text size.
        const isEmptyTextBlock =
          !doc.textBetween(from, to).length && isTextSelection(state.selection);

        if (!view.hasFocus() || empty || isEmptyTextBlock) {
          return false;
        }
        // End default implementation

        // Do not show menu on images
        if (editor.isActive('image')) {
          return false;
        }

        // Do not show menu on code blocks
        if (editor.isActive('codeBlock')) {
          return false;
        }

        // Do not show menu on dividers
        if (editor.isActive('horizontalRule')) {
          return false;
        }

        return true;
      }}
      editor={editor}
    >
      <BubbleMenuItems editor={editor} />
    </StyledBubbleMenu>
  );
};
