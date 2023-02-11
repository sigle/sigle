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
import { useTheme } from 'next-themes';
import { keyframes, styled } from '@sigle/stitches.config';
import { useWindowSize } from '@/hooks/useWindowSize';
import { useEditorStore } from '../store';
import { clarity } from './highlight/clarity-syntax';
import { TipTapPlaceholder } from './extensions/Placeholder';
import { EditorBottomInfo } from './EditorBottomInfo';
import { EditorBubbleMenu } from './BubbleMenu/BubbleMenu';
import { EditorFloatingMenu } from './FloatingMenu/FloatingMenu';
import { TipTapMobileScroll } from './extensions/MobileScroll';
import { slashCommands } from './extensions/SlashCommand/commands';
import { SlashCommands } from './extensions/SlashCommand/SlashCommands';
import { CodeBlockComponent } from './extensions/CodeBlock/CodeBlock';

lowlight.registerLanguage('clarity (beta)', clarity);

const fadeInAnimation = keyframes({
  '0%': { opacity: '0' },
  '100%': { opacity: '1' },
});

const StyledEditorContent = styled(EditorContent, {
  mt: '$8',
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
    animation: `${fadeInAnimation} 75ms $transitions$ease-out`,
  },

  // Image selected style
  '& img.ProseMirror-selectednode': {
    outline: '2px solid $indigo11',
  },
  // Image uploading style
  '& img[data-loading="true"]': {
    opacity: 0.25,
  },
});

export const EditorTipTap = () => {
  const { resolvedTheme } = useTheme();
  const { width } = useWindowSize();
  const isMobile = width ? width < 768 : false;
  const setStory = useEditorStore((state) => state.setStory);

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
      TipTapCodeBlockLowlight.extend({
        addNodeView() {
          return ReactNodeViewRenderer(CodeBlockComponent);
        },
      }).configure({
        lowlight,
      }),
      //   TipTapImage,
      // Marks
      TipTapBold,
      TipTapCode,
      TipTapItalic,
      TipTapStrike,
      TipTapUnderline,
      // Extensions
      TipTapDropcursor.configure({
        color: resolvedTheme === 'dark' ? '#505050' : '#c7c7c7',
        width: 2,
      }),
      TipTapHistory,
      TipTapPlaceholder(isMobile),
      TipTapTypography,
      // Custom extensions
      //   TipTapTwitter,
      //   TipTapCta,
      !isMobile
        ? SlashCommands.configure({
            commands: slashCommands,
          })
        : undefined,
      isMobile ? TipTapMobileScroll : undefined,
    ] as Extensions,
    content: '',
    onUpdate: ({ editor }) => {
      setStory({ content: editor.getHTML() });
    },
  });

  return (
    <div className="prose dark:prose-invert lg:prose-lg">
      <StyledEditorContent editor={editor} />
      {editor && <EditorBottomInfo editor={editor} />}
      {editor && <EditorBubbleMenu editor={editor} isMobile={isMobile} />}
      {editor && <EditorFloatingMenu editor={editor} isMobile={isMobile} />}
      {/* TODO mobile toolbar */}
    </div>
  );
};
