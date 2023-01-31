import { lowlight } from 'lowlight/lib/common';
import {
  useEditor,
  EditorContent,
  ReactNodeViewRenderer,
  Editor,
  Extensions,
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
import TipTapLink from '@tiptap/extension-link';
import TipTapListItem from '@tiptap/extension-list-item';
import TipTapOrderedList from '@tiptap/extension-ordered-list';
import TipTapParagraph from '@tiptap/extension-paragraph';
import TipTapStrike from '@tiptap/extension-strike';
import TipTapText from '@tiptap/extension-text';
import TipTapTypography from '@tiptap/extension-typography';
import TipTapUnderline from '@tiptap/extension-underline';
import TipTapCodeBlockLowlight from '@tiptap/extension-code-block-lowlight';
import CharacterCount from '@tiptap/extension-character-count';
import { clarity } from './highlight/clarity-syntax';
import { keyframes, styled } from '@sigle/stitches.config';

lowlight.registerLanguage('clarity (beta)', clarity);

const fadeInAnimation = keyframes({
  '0%': { opacity: '0' },
  '100%': { opacity: '1' },
});

const StyledEditorContent = styled(EditorContent, {
  '& .ProseMirror': {
    minHeight: 150,
  },
  '& .ProseMirror-focused': {
    outline: 'none',
  },
  // Placeholder plugin style
  '& .ProseMirror .is-empty::before': {
    content: 'attr(data-placeholder)',
    float: 'left',
    color: '$gray8',
    pointerEvents: 'none',
    height: 0,
    animation: `${fadeInAnimation} 75ms cubic-bezier(0, 0, 0.2, 1)`,
  },

  // Image selected style
  '& img.ProseMirror-selectednode': {
    outline: '2px solid $green11',
  },
  // Image uploading style
  '& img[data-loading="true"]': {
    opacity: 0.25,
  },
});

export const EditorTipTap = () => {
  const editor = useEditor({
    extensions: [
      CharacterCount,
      // Nodes
      TipTapDocument,
      TipTapParagraph,
      TipTapText,
      TipTapBlockquote.extend({ content: 'paragraph+' }),
      TipTapLink.configure({
        openOnClick: false,
      }),
      TipTapListItem,
      TipTapBulletList,
      TipTapOrderedList,
      TipTapHardBreak,
      TipTapHeading.configure({
        // Only allow h2 and h3
        levels: [2, 3],
      }),
      TipTapHorizontalRule,
      //   TipTapCodeBlockLowlight.extend({
      //     addNodeView() {
      //       return ReactNodeViewRenderer(CodeBlockComponent);
      //     },
      //   }).configure({
      //     lowlight,
      //   }),
      //   TipTapImage,
      // Marks
      TipTapBold,
      TipTapCode,
      TipTapItalic,
      TipTapStrike,
      TipTapUnderline,
      // Extensions
      //   TipTapDropcursor.configure({
      //     color: resolvedTheme === 'dark' ? '#505050' : '#c7c7c7',
      //     width: 2,
      //   }),
      TipTapHistory,
      //   TipTapPlaceholder(isMobile),
      TipTapTypography,
      // Custom extensions
      //   TipTapTwitter,
      //   TipTapCta,
      //   !isMobile
      //     ? SlashCommands.configure({
      //         commands: slashCommands({ storyId: story.id }),
      //       })
      //     : undefined,
      //   isMobile ? MobileScroll : undefined,
    ] as Extensions,
    content: '',
  });

  return <StyledEditorContent editor={editor} />;
};
