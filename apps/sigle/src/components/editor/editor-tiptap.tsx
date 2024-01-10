import 'highlight.js/styles/night-owl.css';
import { lowlight } from 'lowlight/lib/common';
import {
  useEditor,
  EditorContent,
  ReactNodeViewRenderer,
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
import { useFormContext } from 'react-hook-form';
import { useParams } from 'next/navigation';
import { nanoid } from 'nanoid';
import { useTheme } from 'next-themes';
import { useWindowSize } from '@/hooks/use-window-size';
import { resizeAndUploadImage } from '@/modules/editor/utils/image';
import { Toolbar } from '@/modules/editor/EditorToolbar/EditorToolbar';
import styles from './editor-tiptap.module.css';
import { useEditorStore } from './store';
import { clarity } from './highlight/clarity-syntax';
import { EditorBubbleMenu } from './bubble-menu';
import { TipTapImage } from './extensions/image';
import { EditorBottomInfo } from './bottom-info';
import { EditorFloatingMenu } from './floating-menu';
import { TipTapPlaceholder } from './extensions/placeholder';
import { TipTapMobileScroll } from './extensions/mobile-scroll';
import { SlashCommands } from './extensions/slash-command/slash-commands';
import { slashCommands } from './extensions/slash-command/commands';
import { CodeBlockComponent } from './extensions/code-block';
import { TipTapTwitter } from './extensions/twitter';
import { TipTapCta } from './extensions/cta';

lowlight.registerLanguage('clarity', clarity);

export const EditorTipTap = () => {
  const { resolvedTheme } = useTheme();
  const params = useParams();
  const storyId = params?.storyId as string;
  const { width } = useWindowSize();
  const isMobile = width ? width < 768 : false;
  const { setValue, getValues } = useFormContext<EditorPostFormData>();
  const setEditor = useEditorStore((state) => state.setEditor);

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
        // We disable the link on paste because we have other plugins listening to links like twitter or youtube...
        linkOnPaste: false,
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
      TipTapImage.configure({
        uploadFile: async (file: File) => {
          const id = nanoid();
          const name = `photos/${storyId}/${id}-${file.name}`;
          const imageUrl = await resizeAndUploadImage(file, name);
          return imageUrl;
        },
      }),
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
            commands: slashCommands,
          })
        : undefined,
      isMobile ? TipTapMobileScroll : undefined,
    ] as Extensions,
    content: getValues().content,
    // Expose the editor to the parent so we can use it to get the content
    onCreate: ({ editor }) => {
      setEditor(editor);
    },
    onUpdate: ({ editor }) => {
      setValue('content', editor.getJSON());
    },
  });

  return (
    <div className="prose dark:prose-invert lg:prose-lg">
      <EditorContent className={styles.editor} editor={editor} />

      {editor && !isMobile && <EditorBubbleMenu editor={editor} />}
      {editor && !isMobile && <EditorFloatingMenu editor={editor} />}
      {editor && !isMobile && <EditorBottomInfo editor={editor} />}
      {editor && isMobile && <Toolbar editor={editor} />}
    </div>
  );
};
