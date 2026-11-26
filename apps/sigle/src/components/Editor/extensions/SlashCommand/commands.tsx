import {
  IconBrandX,
  IconBrandYoutube,
  IconCode,
  IconH2,
  IconH3,
  IconLetterT,
  IconLink,
  IconList,
  IconListNumbers,
  IconPhotoUp,
  IconQuote,
  IconSeparatorHorizontal,
} from "@tabler/icons-react";
import type { SlashCommandsCommand } from "./SlashCommands";

export const slashCommands: Array<SlashCommandsCommand> = [
  {
    icon: IconLetterT,
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
    icon: IconH2,
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
    icon: IconH3,
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
    icon: IconPhotoUp,
    title: "Image",
    description: "Upload from your computer",
    section: "basic",
    proOnly: true,
    command: ({ editor, range }) => {
      const input = document.createElement("input");
      input.type = "file";
      input.accept = "image/jpeg,image/png,image/gif";

      input.onchange = async () => {
        const file = input.files?.[0];

        if (!file) {
          return;
        }

        const [mime] = file.type.split("/");

        if (mime !== "image") {
          return;
        }

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
    icon: IconLink,
    title: "Image from URL",
    description: "Embed an image from a link",
    section: "basic",
    keywords: ["image", "url", "link"],
    command: ({ editor, range }) => {
      let chainCommands = editor.chain().focus();

      if (range) {
        // Use deleteRange to clear the text from command chars "/im" etc..
        chainCommands = chainCommands.deleteRange(range);
      }

      chainCommands.insertImageUrlInput().run();
    },
  },
  {
    icon: IconList,
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
    icon: IconListNumbers,
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
    icon: IconQuote,
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
    icon: IconSeparatorHorizontal,
    title: "Divider",
    description: "Create a divider",
    section: "basic",
    command: ({ editor, range }) => {
      let chainCommands = editor.chain().focus();

      if (range) {
        chainCommands = chainCommands.deleteRange(range);
      }

      chainCommands.setHorizontalRule().createParagraphNear().run();
    },
  },
  {
    icon: IconCode,
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
    icon: IconBrandX,
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
    icon: IconBrandYoutube,
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
