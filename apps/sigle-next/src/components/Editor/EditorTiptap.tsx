import 'highlight.js/styles/night-owl.css';
import { useWindowSize } from '@/hooks/useWindowSize';
import TipTapBlockquote from '@tiptap/extension-blockquote';
import TipTapBold from '@tiptap/extension-bold';
import TipTapBulletList from '@tiptap/extension-bullet-list';
import CharacterCount from '@tiptap/extension-character-count';
import TipTapCode from '@tiptap/extension-code';
import TipTapCodeBlockLowlight from '@tiptap/extension-code-block-lowlight';
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
import {
  EditorContent,
  type Extensions,
  ReactNodeViewRenderer,
  useEditor,
} from '@tiptap/react';
import { common, createLowlight } from 'lowlight';
import { useParams } from 'next/navigation';
import { usePostHog } from 'posthog-js/react';
import { useFormContext } from 'react-hook-form';
import { Markdown } from 'tiptap-markdown';
import { EditorBottomInfo } from './BottomInfo';
import { EditorBubbleMenu } from './BubbleMenu';
import type { EditorPostFormData } from './EditorFormProvider';
import { EditorFloatingMenu } from './FloatingMenu';
import './editor-tiptap.css';
import { toast } from 'sonner';
import { CodeBlockComponent } from './extensions/CodeBlock';
import { TipTapImage } from './extensions/Image';
import { TipTapMobileScroll } from './extensions/MobileScroll';
import { TipTapPlaceholder } from './extensions/Placeholder';
import { SlashCommands } from './extensions/SlashCommand/SlashCommands';
import { slashCommands } from './extensions/SlashCommand/commands';
import { TipTapEmbed } from './extensions/Twitter';
import { useEditorStore } from './store';
import { sigleApiClient } from '@/__generated__/sigle-api';

const lowlight = createLowlight(common);

export const EditorTipTap = () => {
  const params = useParams();
  const postId = params.postId as string;
  const posthog = usePostHog();
  const { width } = useWindowSize();
  const isMobile = width ? width < 768 : false;
  const { setValue, getValues } = useFormContext<EditorPostFormData>();
  const setEditor = useEditorStore((state) => state.setEditor);
  const { mutateAsync: uploadMedia } = sigleApiClient.useMutation(
    'post',
    '/api/protected/drafts/{draftId}/upload-media',
  );

  const editor = useEditor({
    immediatelyRender: false,
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
          posthog.capture('editor_image_upload_start', {
            postId,
          });

          const formData = new FormData();
          formData.append('file', file);

          try {
            const data = await uploadMedia({
              params: {
                path: {
                  draftId: postId,
                },
              },
              // biome-ignore lint/suspicious/noExplicitAny: <explanation>
              body: formData as any,
            });

            posthog.capture('editor_image_upload_success', {
              postId,
            });
            return data.url;
            // biome-ignore lint/suspicious/noExplicitAny: <explanation>
          } catch (error: any) {
            toast.error('Failed to upload image', {
              description: error.message,
            });
            posthog.capture('editor_image_upload_error', {
              postId,
              error: error.message,
            });
            throw error;
          }
        },
      }),
      // Marks
      TipTapBold,
      TipTapCode,
      TipTapItalic,
      TipTapStrike,
      TipTapUnderline,
      // Extensions
      Markdown,
      TipTapDropcursor.configure({
        class: 'bg-gray-11',
        width: 2,
      }),
      TipTapHistory,
      TipTapPlaceholder(isMobile),
      TipTapTypography,
      // Custom extensions
      TipTapEmbed,
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
      const contentMarkdown = editor.storage.markdown.getMarkdown();
      setValue('content', contentMarkdown);
    },
  });

  return (
    <div className="prose dark:prose-invert lg:prose-lg pb-5">
      <EditorContent className="editor" editor={editor} />

      {editor && !isMobile && <EditorBubbleMenu editor={editor} />}
      {editor && !isMobile && <EditorFloatingMenu editor={editor} />}
      {editor && !isMobile && <EditorBottomInfo editor={editor} />}
    </div>
  );
};
