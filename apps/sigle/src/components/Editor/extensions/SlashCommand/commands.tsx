import { BulletedListLight } from "@/images/BulletedListLight";
import { CodeLight } from "@/images/CodeLight";
import { DividerLight } from "@/images/DividerLight";
import { Heading2Light } from "@/images/Heading2Light";
import { Heading3Light } from "@/images/Heading3Light";
import { ImageLight } from "@/images/ImageLight";
import { NumberedListLight } from "@/images/NumberedListLight";
import { PlainTextLight } from "@/images/PlainTextLight";
import { QuoteLight } from "@/images/QuoteLight";
import { TwitterLight } from "@/images/TwitterLight";
import { VideoLight } from "@/images/VideoLight";
import type { SlashCommandsCommand } from "./SlashCommands";

export const slashCommands: SlashCommandsCommand[] = [
  {
    icon: PlainTextLight,
    title: "Plain Text",
    description: "Normal paragraph style",
    section: "basic",
    keywords: ["text"],
    command: ({ editor, range }) => {
      if (!range) {
        editor.chain().focus().setParagraph().run();
        return;
      }

      editor.chain().focus().deleteRange(range).setParagraph().run();
    },
  },
  {
    icon: Heading2Light,
    title: "Big Heading",
    description: "Big section Heading",
    section: "basic",
    keywords: ["heading"],
    command: ({ editor, range }) => {
      if (!range) {
        editor.chain().focus().toggleHeading({ level: 2 }).run();
        return;
      }

      editor
        .chain()
        .focus()
        .deleteRange(range)
        .setNode("heading", { level: 2 })
        .run();
    },
  },
  {
    icon: Heading3Light,
    title: "Small Heading",
    description: "Small section Heading",
    section: "basic",
    keywords: ["heading"],
    command: ({ editor, range }) => {
      if (!range) {
        editor.chain().focus().toggleHeading({ level: 3 }).run();
        return;
      }

      editor
        .chain()
        .focus()
        .deleteRange(range)
        .setNode("heading", { level: 3 })
        .run();
    },
  },
  {
    icon: ImageLight,
    title: "Image",
    description: "Upload from your computer",
    section: "basic",
    command: ({ editor, range }) => {
      const input = document.createElement("input");
      input.type = "file";
      input.accept = "image/jpeg,image/png,image/gif";

      input.onchange = async (e) => {
        // biome-ignore lint/suspicious/noExplicitAny: <explanation>
        const file: File | undefined = (e.target as any)?.files?.[0];
        if (!file) return;
        const [mime] = file.type.split("/");
        if (mime !== "image") return;

        if (!range) {
          editor
            .chain()
            .focus()
            .setImageFromFile({
              file,
            })
            .run();
          return;
        }
        editor
          .chain()
          .focus()
          // Use deleteRange to clear the text from command chars "/bu" etc..
          .deleteRange(range)
          .setImageFromFile({
            file,
          })
          .run();
      };

      input.click();
    },
  },
  {
    icon: BulletedListLight,
    title: "Bulleted list",
    description: "Create a bulleted list",
    section: "basic",
    command: ({ editor, range }) => {
      if (!range) {
        editor.chain().focus().toggleBulletList().run();
        return;
      }
      editor
        .chain()
        .focus()
        // Use deleteRange to clear the text from command chars "/bu" etc..
        .deleteRange(range)
        .toggleBulletList()
        .run();
    },
  },
  {
    icon: NumberedListLight,
    title: "Numbered list",
    description: "Create a numbered list",
    section: "basic",
    command: ({ editor, range }) => {
      if (!range) {
        editor.chain().focus().toggleOrderedList().run();
        return;
      }

      editor
        .chain()
        .focus()
        // Use deleteRange to clear the text from command chars "/q" etc..
        .deleteRange(range)
        .toggleOrderedList()
        .run();
    },
  },
  {
    icon: QuoteLight,
    title: "Quote",
    description: "Create a quote",
    section: "basic",
    command: ({ editor, range }) => {
      if (!range) {
        editor.chain().focus().toggleBlockquote().run();
        return;
      }

      editor
        .chain()
        .focus()
        // Use deleteRange to clear the text from command chars "/q" etc..
        .deleteRange(range)
        .toggleBlockquote()
        .run();
    },
  },
  {
    icon: DividerLight,
    title: "Divider",
    description: "Create a divider",
    section: "basic",
    command: ({ editor, range }) => {
      let chainCommands = editor.chain().focus();
      if (range) {
        chainCommands = chainCommands.deleteRange(range);
      }
      chainCommands
        .setHorizontalRule()
        // Here we insert a paragraph after the divider that will be removed directly to fix
        // an issue with TipTap where the isActive('paragraph') function is returning
        // false. The "plus" menu on the left is not showing without this fix.
        .insertContent({
          type: "paragraph",
        })
        .deleteNode("paragraph")
        .run();
    },
  },
  {
    icon: CodeLight,
    title: "Code",
    description: "Create a code snippet",
    section: "basic",
    command: ({ editor, range }) => {
      if (!range) {
        editor.chain().focus().setCodeBlock().run();
        return;
      }

      editor.chain().focus().deleteRange(range).setCodeBlock().run();
    },
  },
  {
    icon: TwitterLight,
    title: "Twitter",
    description: "Add a Twitter embed",
    section: "embed",
    command: ({ editor, range }) => {
      if (!range) {
        editor.commands.setEmbed("twitter");
        return;
      }

      editor
        .chain()
        .focus()
        // Use deleteRange to clear the text from command chars "/q" etc..
        .deleteRange(range)
        .run();
      editor.commands.setEmbed("twitter");
    },
  },
  {
    icon: VideoLight,
    title: "Video",
    description: "Add a video embed (YouTube, etc.)",
    section: "embed",
    keywords: ["youtube"],
    command: ({ editor, range }) => {
      if (!range) {
        editor.commands.setEmbed("video");
        return;
      }
      editor
        .chain()
        .focus()
        // Use deleteRange to clear the text from command chars "/q" etc..
        .deleteRange(range)
        .run();
      editor.commands.setEmbed("video");
    },
  },
];
