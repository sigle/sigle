import { useState, useEffect } from 'react';
import { Editor, BubbleMenu as TipTapBubbleMenu } from '@tiptap/react';
import { isTextSelection } from '@tiptap/core';
import {
  Link1Icon,
  FontBoldIcon,
  FontItalicIcon,
  CodeIcon,
  Cross2Icon,
  StrikethroughIcon,
  UnderlineIcon,
} from '@radix-ui/react-icons';
import { globalCss, styled } from '../../../stitches.config';
import { Flex } from '../../../ui';

// Tippyjs theme used by the bubble menu
const globalStylesCustomEditor = globalCss({
  ".tippy-box[data-theme~='sigle-editor-bubble-menu']": {
    backgroundColor: '$gray11',
  },
  ".tippy-box[data-theme~='sigle-editor-bubble-menu'][data-placement^='top'] > .tippy-arrow::before":
    {
      borderTopColor: '$gray11',
    },
  ".tippy-box[data-theme~='sigle-editor-bubble-menu'][data-placement^='bottom'] > .tippy-arrow::before":
    {
      borderBottomColor: '$gray11',
    },
  ".tippy-box[data-theme~='sigle-editor-bubble-menu'][data-placement^='left'] > .tippy-arrow::before":
    {
      borderLeftColor: '$gray11',
    },
  ".tippy-box[data-theme~='sigle-editor-bubble-menu'][data-placement^='right'] > .tippy-arrow::before":
    {
      borderRightColor: '$gray11',
    },
  ".tippy-box[data-theme~='sigle-editor-bubble-menu'] .tippy-content": {
    padding: 0,
    color: '$gray1',
  },
});

const StyledBubbleMenu = styled(TipTapBubbleMenu, {
  display: 'flex',
  gap: '$3',
  br: '$1',
  py: '$3',
  px: '$4',
});

const BubbleMenuButton = styled('button', {
  color: '$gray1',

  variants: {
    active: {
      true: {
        color: '$orange10',
      },
    },
  },
});

const BubbleMenuInput = styled('input', {
  width: '100%',
  pl: '$2',
  pr: '$1',
  backgroundColor: 'transparent',
  outline: 'none',
});

// Maybe can be used on clicks https://github.com/ueberdosis/tiptap/issues/104#issuecomment-912794709

interface BubbleMenuProps {
  editor: Editor;
}

export const BubbleMenu = ({ editor }: BubbleMenuProps) => {
  globalStylesCustomEditor();

  const [linkState, setLinkState] = useState({ open: false, value: '' });

  // Listen to any key press to detect cmd + k and activate the link edition
  useEffect(() => {
    function onKeyDown(event: KeyboardEvent) {
      // We want all our commands to start with the user pressing ctrl or cmd for mac users
      if ((event.ctrlKey || event.metaKey) && event.key === 'k') {
        onSelectLink();
      }
    }

    window.addEventListener('keydown', onKeyDown);
    return () => window.removeEventListener('keydown', onKeyDown);
  }, []);

  const onSelectLink = () => {
    // Get href of selected link to pre fill the input
    const existingHref = editor.isActive('link')
      ? editor.getAttributes('link').href
      : '';

    setLinkState({
      open: true,
      value: existingHref,
    });
  };

  const onSubmitLink = (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();

    let safeLinkValue = linkState.value.trim();

    if (
      safeLinkValue &&
      !safeLinkValue.startsWith('http') &&
      !safeLinkValue.startsWith('#')
    ) {
      safeLinkValue = `https://${linkState.value}`;
    }

    if (safeLinkValue) {
      const pos = editor.state.selection.$head;
      editor
        .chain()
        .focus()
        .extendMarkRange('link')
        .setLink({ href: safeLinkValue })
        // Set the text selection at the end of the link selection
        // that way user can continue to type easily
        .setTextSelection(pos.end())
        // Unset link selection se when the user continues to type it won't be a link
        // We are using `unsetMark` instead of `unsetLink` to avoid the full selection to be unlinked
        .unsetMark('link')
        .run();
    } else {
      // If input text is empty we unset the link
      editor.chain().focus().extendMarkRange('link').unsetLink().run();
    }

    resetLink();
  };

  const onKeyDown = (event: React.KeyboardEvent) => {
    // If user press escape we hide the link input
    if (event.key === 'Escape') {
      event.preventDefault();
      resetLink();
    }
  };

  const resetLink = () => {
    setLinkState({
      open: false,
      value: '',
    });
  };

  return (
    <StyledBubbleMenu
      tippyOptions={{
        duration: 100,
        theme: 'sigle-editor-bubble-menu',
        onHidden: () => resetLink(),
      }}
      shouldShow={({ editor, state, from, to, view }) => {
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

        /// Do not show on twitter embed
        if (editor.isActive('twitter')) {
          return false;
        }

        /// Do not show on cta
        if (editor.isActive('cta')) {
          return false;
        }

        return true;
      }}
      editor={editor}
    >
      {!linkState.open ? (
        <>
          <BubbleMenuButton
            onClick={() => editor.chain().focus().toggleBold().run()}
            active={editor.isActive('bold')}
          >
            <FontBoldIcon height={18} width={18} />
          </BubbleMenuButton>
          <BubbleMenuButton
            onClick={() => editor.chain().focus().toggleItalic().run()}
            active={editor.isActive('italic')}
          >
            <FontItalicIcon height={18} width={18} />
          </BubbleMenuButton>
          <BubbleMenuButton
            onClick={() => editor.chain().focus().toggleUnderline().run()}
            active={editor.isActive('underline')}
          >
            <UnderlineIcon height={18} width={18} />
          </BubbleMenuButton>
          <BubbleMenuButton
            onClick={() => editor.chain().focus().toggleStrike().run()}
            active={editor.isActive('strike')}
          >
            <StrikethroughIcon height={18} width={18} />
          </BubbleMenuButton>
          <BubbleMenuButton
            onClick={() => editor.chain().focus().toggleCode().run()}
            active={editor.isActive('code')}
          >
            <CodeIcon height={18} width={18} />
          </BubbleMenuButton>
          <BubbleMenuButton
            onClick={() => onSelectLink()}
            active={editor.isActive('link')}
          >
            <Link1Icon height={18} width={18} />
          </BubbleMenuButton>
        </>
      ) : (
        <Flex as="form" onSubmit={onSubmitLink}>
          <BubbleMenuInput
            value={linkState.value}
            onKeyDown={onKeyDown}
            onChange={(e) =>
              setLinkState((state) => ({ ...state, value: e.target.value }))
            }
            placeholder="Enter link ..."
            autoFocus
          />
          <BubbleMenuButton
            type="button"
            onClick={() => resetLink()}
            active={false}
          >
            <Cross2Icon height={18} width={18} />
          </BubbleMenuButton>
        </Flex>
      )}
    </StyledBubbleMenu>
  );
};
