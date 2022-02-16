import {
  BulletedListLight,
  NumberedListLight,
  Heading1Light,
  Heading2Light,
  Heading3Light,
  ImageLight,
  QuoteLight,
} from '../../icons';
import { SlashCommandsCommand } from './extensions/SlashCommands';
import { styled } from '../../stitches.config';
import { Flex, Text } from '../../ui';
import { resizeImage } from '../../utils/image';
import { storage } from '../../utils/blockstack';
import { generateRandomId } from '../../utils';

const resizeAndUploadImage = async (
  image: File,
  name: string
): Promise<string> => {
  return new Promise((resolve) => {
    const reader = new FileReader();

    reader.readAsDataURL(image);

    reader.addEventListener('load', async () => {
      // Resize the image client side for faster upload and to save storage space
      // We skip resizing gif as it's turning them as single image
      let blob: Blob | File = image;
      if (image.type !== 'image/gif') {
        blob = await resizeImage(image, { maxWidth: 2000 });
      }

      const imageUrl = await storage.putFile(name, blob as any, {
        encrypt: false,
        contentType: image.type,
      });

      resolve(imageUrl);
    });
  });
};

export const slashCommands: SlashCommandsCommand[] = [
  {
    icon: Heading1Light,
    title: 'Heading 1',
    description: 'Large section Heading',
    command: ({ editor, range }) => {
      if (!range) {
        editor.chain().focus().toggleHeading({ level: 1 }).run();
        return;
      }

      editor
        .chain()
        .focus()
        .deleteRange(range)
        .setNode('heading', { level: 1 })
        .run();
    },
  },
  {
    icon: Heading2Light,
    title: 'Heading 2',
    description: 'Medium section Heading',
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
    title: 'Heading 3',
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
    icon: QuoteLight,
    title: 'Divider',
    description: 'Create a divider',
    command: ({ editor, range }) => {
      if (!range) {
        editor.chain().focus().setHorizontalRule().run();
        return;
      }

      editor.chain().focus().deleteRange(range).setHorizontalRule().run();
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
        if (range) {
          editor
            .chain()
            .focus()
            .deleteRange(range)
            .setImage({ src: preview })
            .run();
        } else {
          editor.chain().focus().setImage({ src: preview }).run();
        }

        const id = generateRandomId();
        // TODO real story id
        const story = { id: 'tiptap-editor-dev' };
        const name = `photos/${story.id}/${id}-${file.name}`;
        const imageUrl = await resizeAndUploadImage(file, name);

        editor
          .chain()
          .focus()
          .updateAttributes('image', {
            src: imageUrl,
          })
          // Create a new paragraph so user can continue writing
          .createParagraphNear()
          .run();
      };

      input.click();
    },
  },
];

const CommandsListItem = styled('li', {
  cursor: 'pointer',
  display: 'flex',
  alignItems: 'center',
  width: '100%',
  py: '$1',
  px: '$3',
  '&.is-selected,&:hover': {
    backgroundColor: '$gray3',
  },
});

export const SlashCommandsList = (props: {
  items: SlashCommandsCommand[];
  selectedIndex: number;
  selectItem: (index: number) => void;
}) => {
  const { items, selectedIndex, selectItem } = props;

  return (
    <Flex gap="2" direction="column" css={{ maxHeight: 360, overflow: 'auto' }}>
      {items.map(({ title, description, icon: Icon }, idx) => (
        <CommandsListItem
          key={idx}
          className={selectedIndex === idx ? 'is-selected' : ''}
          onClick={() => selectItem(idx)}
        >
          <Icon width={35} height={35} />
          <Flex direction="column" css={{ ml: '$2' }}>
            <Text>{title}</Text>
            <Text css={{ color: '$gray9', mt: '-8px' }}>{description}</Text>
          </Flex>
        </CommandsListItem>
      ))}
    </Flex>
  );
};
