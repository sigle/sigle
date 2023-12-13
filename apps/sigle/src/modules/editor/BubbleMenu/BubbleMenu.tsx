import {
  Editor,
  BubbleMenu as TipTapBubbleMenu,
  isTextSelection,
} from '@tiptap/react';
import { useEffect } from 'react';
import {
  Link1Icon,
  FontBoldIcon,
  FontItalicIcon,
  CodeIcon,
  StrikethroughIcon,
  UnderlineIcon,
} from '@radix-ui/react-icons';
import { globalCss, styled } from '../../../stitches.config';
import { EditorBubbleMenuLink } from './BubbleMenuLink';
import { useBubbleMenuStore } from './store';

// Tippyjs theme used by the bubble menu
const globalStylesBubbleMenu = globalCss({
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

interface EditorBubbleMenuProps {
  editor: Editor;
}

export const BubbleMenu = ({ editor }: EditorBubbleMenuProps) => {
  globalStylesBubbleMenu();

  const linkOpen = useBubbleMenuStore((state) => state.linkOpen);
  const toggleLink = useBubbleMenuStore((state) => state.toggleLink);

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
    toggleLink(true);
  };

  return (
    <StyledBubbleMenu
      tippyOptions={{
        duration: 100,
        theme: 'sigle-editor-bubble-menu',
        onHidden: () => {
          // When bubble menu is hidden, reset the link state
          toggleLink(false);
        },
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
      {!linkOpen ? (
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
        <EditorBubbleMenuLink editor={editor} />
      )}
    </StyledBubbleMenu>
  );
};
