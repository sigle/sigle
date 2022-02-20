import 'highlight.js/styles/night-owl.css';
import {
  useEditor,
  EditorContent,
  ReactNodeViewRenderer,
  Editor,
} from '@tiptap/react';
import TipTapBlockquote from '@tiptap/extension-blockquote';
import TipTapBold from '@tiptap/extension-bold';
import TipTapBulletList from '@tiptap/extension-bullet-list';
import TipTapCode from '@tiptap/extension-code';
import TipTapDocument from '@tiptap/extension-document';
import TipTapDropcursor from '@tiptap/extension-dropcursor';
import TipTapHardBreak from '@tiptap/extension-hard-break';
import TipTapHeading from '@tiptap/extension-heading';
import TipTapHistory from '@tiptap/extension-history';
import TipTapHorizontalRule from '@tiptap/extension-horizontal-rule';
import TipTapItalic from '@tiptap/extension-italic';
import TipTapImage from '@tiptap/extension-image';
import TipTapLink from '@tiptap/extension-link';
import TipTapListItem from '@tiptap/extension-list-item';
import TipTapOrderedList from '@tiptap/extension-ordered-list';
import TipTapParagraph from '@tiptap/extension-paragraph';
import TipTapPlaceholder from '@tiptap/extension-placeholder';
import TipTapStrike from '@tiptap/extension-strike';
import TipTapText from '@tiptap/extension-text';
import TipTapCodeBlockLowlight from '@tiptap/extension-code-block-lowlight';
import { lowlight } from 'lowlight/lib/common.js';
import { SlashCommands } from './extensions/SlashCommands';
import { BubbleMenu } from './BubbleMenu';
import { slashCommands, SlashCommandsList } from './InlineMenu';
import { FloatingMenu } from './FloatingMenu';
import { styled, globalCss, keyframes } from '../../stitches.config';
import { CodeBlockComponent } from './extensions/CodeBlock';
import { forwardRef, useImperativeHandle } from 'react';

const fadeInAnimation = keyframes({
  '0%': { opacity: '0' },
  '100%': { opacity: '1' },
});

const StyledEditorContent = styled(EditorContent, {
  '& .ProseMirror': {
    py: '$4',
    minHeight: 150,
  },
  '& .ProseMirror-focused': {
    outline: 'none',
  },
  // Placeholder plugin style
  '& .ProseMirror p.is-empty::before': {
    content: 'attr(data-placeholder)',
    float: 'left',
    color: '#bbbaba',
    pointerEvents: 'none',
    height: 0,
    animation: `${fadeInAnimation} 75ms cubic-bezier(0, 0, 0.2, 1)`,
  },
  // Image selected style
  '& img.ProseMirror-selectednode': {
    outline: '1px solid $orange11',
  },
  // Code block style
  '& pre': {
    backgroundColor: '$gray11 !important',
  },
  // Image uploading style
  '& img[data-loading="true"]': {
    opacity: 0.25,
  },
});

// Tippyjs theme used by the slash command menu
const globalStylesCustomEditor = globalCss({
  ".tippy-box[data-theme~='sigle-editor'] .tippy-content": {
    padding: 0,
    backgroundColor: '$gray1',
    boxShadow:
      '0 4px 6px -1px rgb(0 0 0 / 0.1), 0 2px 4px -2px rgb(0 0 0 / 0.1)',
    br: '$1',
    minWidth: '280px',
  },
});

/**
 * TODO
 * - check all the shortcuts and update the GitBook
 * - check all the markdown shorcuts
 * - investigate figure extension instead of image
 * - separate PR - mobile UI
 * - WIP separate PR - data migration from slate
 */

interface TipTapEditorProps {
  // story: Story;
}

export const TipTapEditor = forwardRef<{
  getEditor: () => Editor | null;
}>(({}: TipTapEditorProps, ref) => {
  globalStylesCustomEditor();

  const editor = useEditor({
    extensions: [
      // Nodes
      TipTapDocument,
      TipTapParagraph,
      TipTapText,
      TipTapBlockquote,
      TipTapLink.configure({
        openOnClick: false,
      }),
      TipTapListItem,
      TipTapBulletList,
      TipTapOrderedList,
      TipTapHardBreak,
      TipTapHeading.configure({
        // Only allow h1, h2 and h3
        levels: [1, 2, 3],
      }),
      TipTapHorizontalRule,
      TipTapCodeBlockLowlight.extend({
        addNodeView() {
          return ReactNodeViewRenderer(CodeBlockComponent);
        },
      }).configure({
        lowlight,
      }),
      TipTapImage.extend({
        addAttributes() {
          return {
            ...this.parent?.(),
            loading: {
              default: false,
              renderHTML: (attributes) => {
                if (attributes.loading) {
                  return {
                    'data-loading': attributes.loading,
                  };
                }
              },
            },
          };
        },
      }),
      // Marks
      TipTapBold,
      TipTapCode,
      TipTapItalic,
      TipTapStrike,
      // Extensions
      TipTapDropcursor,
      TipTapHistory,
      TipTapPlaceholder.configure({
        placeholder: ({ editor }) => {
          const currentPos = editor.state.selection.$anchor.pos;
          return currentPos === 1
            ? 'Start your story here...'
            : "Type '/' for commands";
        },
      }),
      // Custom extensions
      SlashCommands.configure({
        commands: slashCommands,
        component: SlashCommandsList,
      }),
    ],
    content: '<p>Hello World! 🌎️</p>',
  });

  // Here we extend the received ref so the parent can get the editor content at any time
  useImperativeHandle(
    ref,
    () => ({
      // TODO cleanup empty <p>, <h1> etc tags, basically all empty tags
      getEditor: () => editor,
    }),
    [editor]
  );

  return (
    <>
      {editor && <BubbleMenu editor={editor} />}
      {editor && <FloatingMenu editor={editor} />}

      <StyledEditorContent editor={editor} />
    </>
  );
});
