import {
  useEditor,
  EditorContent,
  BubbleMenu,
  FloatingMenu,
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
import TipTapItalic from '@tiptap/extension-italic';
import TipTapLink from '@tiptap/extension-link';
import TipTapListItem from '@tiptap/extension-list-item';
import TipTapOrderedList from '@tiptap/extension-ordered-list';
import TipTapParagraph from '@tiptap/extension-paragraph';
import TipTapPlaceholder from '@tiptap/extension-placeholder';
import TipTapStrike from '@tiptap/extension-strike';
import TipTapText from '@tiptap/extension-text';
import TipTapUnderline from '@tiptap/extension-underline';
import {
  MdCode,
  MdFormatBold,
  MdFormatItalic,
  MdFormatListBulleted,
  MdFormatListNumbered,
  MdFormatQuote,
  MdFormatUnderlined,
  MdLink,
  MdLooks3,
  MdLooksOne,
  MdLooksTwo,
  MdAddAPhoto,
} from 'react-icons/md';
import styled, { css } from 'styled-components';
import tw from 'twin.macro';
import {
  SlashCommands,
  SlashCommandsCommand,
} from './extensions/SlashCommands';

const StyledEditorContent = styled(EditorContent)`
  .ProseMirror {
    ${tw`py-4`};
    min-height: 150px;
  }
  .ProseMirror-focused {
    outline: none;
  }

  // Placeholder plugin style
  .ProseMirror p.is-empty::before {
    content: attr(data-placeholder);
    float: left;
    color: #bbbaba;
    pointer-events: none;
    height: 0;
  }
`;

const StyledBubbleMenu = styled(BubbleMenu)`
  ${tw`flex rounded`};
  background-color: #222;
`;

const BubbleMenuButton = styled.button<{ active: boolean }>`
  ${tw`text-white cursor-pointer`};
  padding-left: 0.3rem;
  padding-right: 0.3rem;

  ${(props) =>
    props.active &&
    css`
      ${tw`text-pink`};
    `}
`;

const CommandsListItem = styled.li`
  ${tw`cursor-pointer block w-full py-2 px-1 flex items-center`};

  svg {
    ${tw`mr-1`};
  }

  &.is-selected,
  &:hover {
    ${tw`text-pink`};
  }
`;

const CommandsList = (props: {
  items: SlashCommandsCommand[];
  selectedIndex: number;
  selectItem: (index: number) => void;
}) => {
  const { items, selectedIndex, selectItem } = props;

  return (
    <ul>
      {items.map(({ title, icon: Icon }, idx) => (
        <CommandsListItem
          key={idx}
          className={selectedIndex === idx ? 'is-selected' : ''}
          onClick={() => selectItem(idx)}
        >
          <Icon size={18} />
          {title}
        </CommandsListItem>
      ))}
    </ul>
  );
};

/**
 * TODO
 * - link UI
 * - link button in bubble menu
 * - link should show on cmd + k
 * - block quotes seems to add the " char before and after the quote
 * - mobile UI
 * - left menu that trigger the commands menu
 * - check all the shortcuts
 * - data migration from slate
 */

export const TipTapEditor = () => {
  const editor = useEditor({
    extensions: [
      // Nodes
      TipTapDocument,
      TipTapParagraph,
      TipTapText,
      TipTapBlockquote,
      TipTapLink,
      TipTapListItem,
      TipTapBulletList,
      TipTapOrderedList,
      TipTapHardBreak,
      TipTapHeading.configure({
        // Only allow h1, h2 and h3
        levels: [1, 2, 3],
      }),
      // Marks
      TipTapBold,
      TipTapCode,
      TipTapItalic,
      TipTapStrike,
      TipTapUnderline,
      // Extensions
      TipTapDropcursor,
      TipTapHistory,
      TipTapPlaceholder.configure({
        placeholder: ({ node, editor }) => {
          const currentPos = editor.state.selection.$anchor.pos;
          return currentPos === 1
            ? 'Start your story here...'
            : "Type '/' for commands";
        },
      }),
      // Custom extensions
      SlashCommands.configure({
        commands: [
          {
            icon: MdLooksOne,
            title: 'Heading 1',
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
            icon: MdLooksTwo,
            title: 'Heading 2',
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
            icon: MdLooks3,
            title: 'Heading 3',
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
            icon: MdAddAPhoto,
            title: 'Image',
            command: ({ editor, range }) => {
              editor.chain().focus().deleteRange(range).setMark('bold').run();
            },
          },
        ],
        component: CommandsList,
      }),
    ],
    content: '<p>Hello World! 🌎️</p>',
  });

  return (
    <>
      {editor && (
        <StyledBubbleMenu tippyOptions={{ duration: 100 }} editor={editor}>
          <BubbleMenuButton
            onClick={() => editor.chain().focus().toggleBold().run()}
            active={editor.isActive('bold')}
          >
            <MdFormatBold size={18} />
          </BubbleMenuButton>
          <BubbleMenuButton
            onClick={() => editor.chain().focus().toggleItalic().run()}
            active={editor.isActive('italic')}
          >
            <MdFormatItalic size={18} />
          </BubbleMenuButton>
          <BubbleMenuButton
            onClick={() => editor.chain().focus().toggleUnderline().run()}
            active={editor.isActive('underline')}
          >
            <MdFormatUnderlined size={18} />
          </BubbleMenuButton>
          <BubbleMenuButton
            onClick={() => editor.chain().focus().toggleCode().run()}
            active={editor.isActive('code')}
          >
            <MdCode size={18} />
          </BubbleMenuButton>
          <BubbleMenuButton
            onClick={() => editor.chain().focus().toggleBlockquote().run()}
            active={editor.isActive('blockquote')}
          >
            <MdFormatQuote size={18} />
          </BubbleMenuButton>
          <BubbleMenuButton
            onClick={() =>
              editor.chain().focus().toggleHeading({ level: 1 }).run()
            }
            active={editor.isActive('heading', { level: 1 })}
          >
            <MdLooksOne size={18} />
          </BubbleMenuButton>
          <BubbleMenuButton
            onClick={() =>
              editor.chain().focus().toggleHeading({ level: 2 }).run()
            }
            active={editor.isActive('heading', { level: 2 })}
          >
            <MdLooksTwo size={18} />
          </BubbleMenuButton>
          <BubbleMenuButton
            onClick={() =>
              editor.chain().focus().toggleHeading({ level: 3 }).run()
            }
            active={editor.isActive('heading', { level: 3 })}
          >
            <MdLooks3 size={18} />
          </BubbleMenuButton>
          <BubbleMenuButton
            onClick={() => editor.chain().focus().toggleOrderedList().run()}
            active={editor.isActive('orderedList')}
          >
            <MdFormatListNumbered size={18} />
          </BubbleMenuButton>
          <BubbleMenuButton
            onClick={() => editor.chain().focus().toggleBulletList().run()}
            active={editor.isActive('bulletList')}
          >
            <MdFormatListBulleted size={18} />
          </BubbleMenuButton>
          <BubbleMenuButton
            onClick={() => alert('TODO')}
            active={editor.isActive('link')}
          >
            <MdLink size={18} />
          </BubbleMenuButton>
        </StyledBubbleMenu>
      )}

      <StyledEditorContent editor={editor} />
    </>
  );
};
