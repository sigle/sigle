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
    icon: ImageLight,
    title: 'Image',
    description: 'Upload from your computer',
    command: ({ editor, range }) => {
      // TODO bubble menu should not be shown on the image
      // TODO see with Quentin how to do the loading part

      const input = document.createElement('input');
      input.type = 'file';
      input.accept = 'image/jpeg,image/png,image/gif';

      input.onchange = (e) => {
        const file = e.target?.files?.[0];
        const [mime] = file.type.split('/');
        if (mime !== 'image') {
          return;
        }

        console.log(file);

        // We show a preview of  the image image as uploading can take a while...
        const preview = URL.createObjectURL(file);
        if (range) {
          editor
            .chain()
            .focus()
            .deleteRange(range)
            // TODO show loader image placeholder?
            .setImage({ src: preview })
            .run();
        } else {
          editor
            .chain()
            .focus()
            // TODO show loader image placeholder?
            .setImage({ src: preview })
            .run();
        }

        const reader = new FileReader();
        const id = generateRandomId();

        reader.readAsDataURL(file);

        // TODO after done uploading cursor should be ready to write after the image
        // TODO real story id
        const story = { id: 'tiptap-editor-dev' };

        reader.addEventListener('load', async () => {
          // Resize the image client side for faster upload and to save storage space
          // We skip resizing gif as it's turning them as single image
          let blob: Blob | File = file;
          if (file.type !== 'image/gif') {
            blob = await resizeImage(file, { maxWidth: 2000 });
          }

          const name = `photos/${story.id}/${id}-${file.name}`;
          const imageUrl = await storage.putFile(name, blob as any, {
            encrypt: false,
            contentType: file.type,
          });

          editor
            .chain()
            .focus()
            .updateAttributes('image', {
              src: imageUrl,
            })
            .run();
        });
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
