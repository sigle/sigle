import "highlight.js/styles/night-owl.css";
import TipTapBlockquote from "@tiptap/extension-blockquote";
import TipTapBold from "@tiptap/extension-bold";
import TipTapBulletList from "@tiptap/extension-bullet-list";
import TipTapCode from "@tiptap/extension-code";
import TipTapCodeBlockLowlight from "@tiptap/extension-code-block-lowlight";
import TipTapDocument from "@tiptap/extension-document";
import TipTapHardBreak from "@tiptap/extension-hard-break";
import TipTapHeading from "@tiptap/extension-heading";
import TipTapHorizontalRule from "@tiptap/extension-horizontal-rule";
import TipTapItalic from "@tiptap/extension-italic";
import TipTapLink from "@tiptap/extension-link";
import TipTapListItem from "@tiptap/extension-list-item";
import TipTapOrderedList from "@tiptap/extension-ordered-list";
import TipTapParagraph from "@tiptap/extension-paragraph";
import TipTapStrike from "@tiptap/extension-strike";
import TipTapText from "@tiptap/extension-text";
import TipTapTypography from "@tiptap/extension-typography";
import TipTapUnderline from "@tiptap/extension-underline";
import {
  CharacterCount as TipTapCharacterCount,
  Dropcursor as TipTapDropcursor,
  UndoRedo as TipTapUndoRedo,
} from "@tiptap/extensions";
import {
  EditorContent,
  type Extensions,
  ReactNodeViewRenderer,
  useEditor,
} from "@tiptap/react";
import { common, createLowlight } from "lowlight";
import { useParams } from "next/navigation";
import { usePostHog } from "posthog-js/react";
import { useFormContext } from "react-hook-form";
import { Markdown } from "tiptap-markdown";
import { useWindowSize } from "@/hooks/useWindowSize";
import { EditorBottomInfo } from "./BottomInfo";
import { EditorBubbleMenu } from "./BubbleMenu";
import type { EditorPostFormData } from "./EditorFormProvider";
import { EditorFloatingMenu } from "./FloatingMenu";
import "./editor-tiptap.css";
import { toast } from "sonner";
import { sigleApiClient } from "@/lib/sigle";
import { CodeBlockComponent } from "./extensions/CodeBlock";
import { TipTapImage } from "./extensions/Image";
import { TipTapMobileScroll } from "./extensions/MobileScroll";
import { TipTapPlaceholder } from "./extensions/Placeholder";
import { slashCommands } from "./extensions/SlashCommand/commands";
import { SlashCommands } from "./extensions/SlashCommand/SlashCommands";
import { TipTapEmbed } from "./extensions/Twitter";
import { useEditorStore } from "./store";

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
    "post",
    "/api/protected/drafts/{draftId}/upload-media",
  );

  const editor = useEditor({
    immediatelyRender: true,
    extensions: [
      TipTapCharacterCount,
      // Nodes
      TipTapDocument,
      TipTapParagraph,
      TipTapText,
      TipTapBlockquote.extend({ content: "paragraph+" }),
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
          posthog.capture("editor_image_upload_start", {
            postId,
          });

          const formData = new FormData();
          formData.append("file", file);

          try {
            const data = await uploadMedia({
              params: {
                path: {
                  draftId: postId,
                },
              },
              // biome-ignore lint/suspicious/noExplicitAny: ok
              body: formData as any,
            });

            posthog.capture("editor_image_upload_success", {
              postId,
            });
            return data.url;
            // biome-ignore lint/suspicious/noExplicitAny: ok
          } catch (error: any) {
            toast.error("Failed to upload image", {
              description: error.message,
            });
            posthog.capture("editor_image_upload_error", {
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
        class: "bg-gray-11",
        width: 2,
      }),
      TipTapUndoRedo,
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
      const contentMarkdown = editor.storage.markdown.getMarkdown();
      if (getValues("content") !== contentMarkdown) {
        setValue("content", contentMarkdown);
      }
      setEditor(editor);
    },
    onUpdate: ({ editor }) => {
      const contentMarkdown = editor.storage.markdown.getMarkdown();
      setValue("content", contentMarkdown);
    },
  });

  return (
    <div className="prose pb-5 lg:prose-lg dark:prose-invert">
      {/* eslint-disable-next-line better-tailwindcss/no-unregistered-classes */}
      <EditorContent className="editor" editor={editor} />
      {editor && !isMobile && <EditorBubbleMenu editor={editor} />}
      {editor && !isMobile && <EditorFloatingMenu editor={editor} />}
      {editor && !isMobile && <EditorBottomInfo editor={editor} />}
    </div>
  );
};
