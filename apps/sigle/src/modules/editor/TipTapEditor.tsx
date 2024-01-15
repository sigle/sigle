import 'highlight.js/styles/night-owl.css';
import { forwardRef, useEffect, useImperativeHandle, useState } from 'react';
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
import { lowlight } from 'lowlight/lib/common';
import CharacterCount from '@tiptap/extension-character-count';
import { useTheme } from 'next-themes';
import { styled, globalCss, keyframes, darkTheme } from '../../stitches.config';
import { Story } from '../../types';
import { Placeholder as TipTapPlaceholder } from './extensions/Placeholder';
import { SlashCommands } from './extensions/SlashCommand/SlashCommands';
import { slashCommands } from './extensions/SlashCommand/commands';
import { CodeBlockComponent } from './extensions/CodeBlock';
import { clarity } from './utils/clarity-syntax';
import { TipTapImage } from './extensions/Image';
import { Toolbar } from './EditorToolbar/EditorToolbar';
import { Twitter as TipTapTwitter } from './extensions/Twitter';
import { Cta as TipTapCta } from './extensions/CallToAction';
import { EditorBubbleMenu } from '@/components/editor/bubble-menu';
import { EditorFloatingMenu } from '@/components/editor/floating-menu';
import { TipTapMobileScroll } from '@/components/editor/extensions/mobile-scroll';
import { EditorBottomInfo } from '@/components/editor/bottom-info';

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

// Tippyjs theme used by the slash command menu
const globalStylesCustomEditor = globalCss({
  '.tippy-box': {
    br: '$3',
    backgroundColor: '$gray1',
  },
  ".tippy-box[data-theme~='sigle-editor'] .tippy-content": {
    overflow: 'hidden',
    padding: 0,
    backgroundColor: '$gray1',
    br: '$3',
    minWidth: '280px',
    boxShadow:
      '0px 8px 20px rgba(8, 8, 8, 0.09), 0px 10px 18px rgba(8, 8, 8, 0.06), 0px 5px 14px rgba(8, 8, 8, 0.05), 0px 3px 8px rgba(8, 8, 8, 0.05), 0px 1px 5px rgba(8, 8, 8, 0.04), 0px 1px 2px rgba(8, 8, 8, 0.03), 0px 0.2px 1px rgba(8, 8, 8, 0.02)',

    [`.${darkTheme} &`]: {
      boxShadow:
        '0px 8px 20px rgba(8, 8, 8, 0.3), 0px 10px 18px rgba(8, 8, 8, 0.28), 0px 5px 14px rgba(8, 8, 8, 0.24), 0px 3px 8px rgba(8, 8, 8, 0.2), 0px 1px 5px rgba(8, 8, 8, 0.18), 0px 1px 2px rgba(8, 8, 8, 0.16), 0px 0.2px 1px rgba(8, 8, 8, 0.08)',
    },
  },
});

interface TipTapEditorProps {
  story: Story;
  editable?: boolean;
}

lowlight.registerLanguage('clarity (beta)', clarity);

export const TipTapEditor = forwardRef<
  {
    getEditor: () => Editor | null;
  },
  TipTapEditorProps
>(({ story, editable = true }, ref) => {
  const [showShortcutsDialog, setShowShortcutsDialog] = useState(false);
  const { resolvedTheme } = useTheme();
  const [width, setWidth] = useState(
    typeof window !== 'undefined' ? window.innerWidth : 1000,
  );
  // TODO is story really needed? Could it be just the content prop?
  globalStylesCustomEditor();

  const handleCancelShortcuts = () => {
    setShowShortcutsDialog(false);
  };

  const isMobile = width < 768;

  const editor = useEditor({
    editable,
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
      TipTapImage,
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
      TipTapTwitter,
      TipTapCta,
      !isMobile
        ? SlashCommands.configure({
            commands: slashCommands({ storyId: story.id }),
          })
        : undefined,
      isMobile ? TipTapMobileScroll : undefined,
    ] as Extensions,
    content: story.contentVersion === '2' ? story.content : '',
  });

  // Here we extend the received ref so the parent can get the editor content at any time
  useImperativeHandle(
    ref,
    () => ({
      // TODO cleanup empty <p>, <h1> etc tags, basically all empty tags
      getEditor: () => editor,
    }),
    [editor],
  );

  useEffect(() => {
    window.addEventListener('resize', () => setWidth(window.innerWidth));
    return () => {
      window.removeEventListener('resize', () => setWidth(window.innerWidth));
    };
  }, []);

  return (
    <>
      {editor && !isMobile && <EditorBubbleMenu editor={editor} />}
      {editor && !isMobile && <EditorFloatingMenu editor={editor} />}

      {/* editor is not set while doing SSR so we render the HTNL as it is for SEO */}
      {editor ? (
        <StyledEditorContent editor={editor} />
      ) : (
        <div
          dangerouslySetInnerHTML={{
            __html: story.contentVersion === '2' ? story.content : '',
          }}
        />
      )}

      {editable && !isMobile && editor && <EditorBottomInfo editor={editor} />}
      {editable && isMobile && <Toolbar editor={editor} story={story} />}
    </>
  );
});
