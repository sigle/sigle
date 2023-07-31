import { findChildren } from '@tiptap/core';
import {
  BulletedListLight,
  CodeLight,
  DividerLight,
  NumberedListLight,
  Heading2Light,
  Heading3Light,
  ImageLight,
  QuoteLight,
} from '../../../../icons';
import { SlashCommandsCommand } from './SlashCommands';
import { generateRandomId } from '../../../../utils';
import { resizeAndUploadImage } from '../../utils/image';
import { PlainTextLight } from '../../../../icons/PlainTextLight';
import { TwitterLight } from '../../../../icons/TwitterLight';
import { CtaIcon } from '../../../../icons/CtaIcon';

export const slashCommands = ({
  storyId,
}: {
  storyId: string;
}): SlashCommandsCommand[] => [
  {
    icon: PlainTextLight,
    title: 'Plain Text',
    description: 'Normal paragraph style',
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
    title: 'Big Heading',
    description: 'Big section Heading',
    command: ({ editor, range }) => {
      if (!range) {
        editor.chain().focus().toggleHeading({ level: 2 }).run();
        return;
      }

      editor
        .chain()
        .focus()
        .deleteRange(range)
        .setNode('heading', { level: 2 })
        .run();
    },
  },
  {
    icon: Heading3Light,
    title: 'Small Heading',
    description: 'Small section Heading',
    command: ({ editor, range }) => {
      if (!range) {
        editor.chain().focus().toggleHeading({ level: 3 }).run();
        return;
      }

      editor
        .chain()
        .focus()
        .deleteRange(range)
        .setNode('heading', { level: 3 })
        .run();
    },
  },
  {
    icon: ImageLight,
    title: 'Image',
    description: 'Upload from your computer',
    command: ({ editor, range }) => {
      const input = document.createElement('input');
      input.type = 'file';
      input.accept = 'image/jpeg,image/png,image/gif';

      input.onchange = async (e) => {
        const file: File | undefined = (e.target as any)?.files?.[0];
        if (!file) return;
        const [mime] = file.type.split('/');
        if (mime !== 'image') return;

        // We show a preview of  the image image as uploading can take a while...
        const preview = URL.createObjectURL(file);
        const id = generateRandomId();
        let chainCommands = editor.chain().focus();
        if (range) {
          chainCommands = chainCommands.deleteRange(range);
        }
        chainCommands
          .setImage({ src: preview })
          .updateAttributes('image', { loading: true, id })
          .run();

        const name = `photos/${storyId}/${id}-${file.name}`;
        const imageUrl = await resizeAndUploadImage(file, name);

        // Preload the new image so there is no flicker
        const uploadedImage = new Image();
        uploadedImage.src = imageUrl;
        uploadedImage.onload = () => {
          // When an image finished being uploaded, the selection of the user might habe changed
          // so we need to find the right image associated with the ID in order to update it.
          editor
            .chain()
            .focus()
            .command(({ tr }) => {
              const doc = tr.doc;
              const images = findChildren(
                doc,
                (node) => node.type.name === 'image' && node.attrs.id === id,
              );
              const image = images[0];
              if (!image || images.length > 1) {
                return false;
              }

              tr.setNodeMarkup(image.pos, undefined, {
                ...image.node.attrs,
                src: imageUrl,
                loading: false,
              });
              return true;
            })
            .run();

          // Create a new paragraph so user can continue writing
          editor.commands.createParagraphNear();
        };
      };

      input.click();
    },
  },
  {
    icon: BulletedListLight,
    title: 'Bulleted list',
    description: 'Create a bulleted list',
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
    title: 'Numbered list',
    description: 'Create a numbered list',
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
    title: 'Quote',
    description: 'Create a quote',
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
    title: 'Divider',
    description: 'Create a divider',
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
          type: 'paragraph',
        })
        .deleteNode('paragraph')
        .run();
    },
  },
  {
    icon: CodeLight,
    title: 'Code',
    description: 'Create a code snippet',
    command: ({ editor, range }) => {
      if (!range) {
        editor.chain().focus().setCodeBlock().run();
        return;
      }

      editor.chain().focus().deleteRange(range).setCodeBlock().run();
    },
  },
  {
    icon: CtaIcon,
    title: 'Call To Action',
    description: 'Add a call to action button',
    command: ({ editor, range }) => {
      if (!range) {
        editor.commands.setCta();
        return;
      }

      editor
        .chain()
        .focus()
        // Use deleteRange to clear the text from command chars "/q" etc..
        .deleteRange(range)
        .run();
      editor.commands.setCta();
    },
  },
  {
    icon: TwitterLight,
    title: 'Twitter',
    description: '/Twitter [Tweet URL]',
    command: ({ editor, range }) => {
      if (!range) {
        editor.commands.setTweet();
        return;
      }

      editor
        .chain()
        .focus()
        // Use deleteRange to clear the text from command chars "/q" etc..
        .deleteRange(range)
        .run();
      editor.commands.setTweet();
    },
  },
];
