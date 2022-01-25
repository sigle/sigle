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

export const slashCommands: SlashCommandsCommand[] = [
  {
    icon: Heading1Light,
    title: 'Heading 1',
    description: 'Large section Heading',
    command: ({ editor, range }) => {
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
      // TODO get it working
      // fileUploaderRef.current?.click();
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
