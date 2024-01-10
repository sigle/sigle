import {
  BulletedListLight,
  CodeLight,
  DividerLight,
  NumberedListLight,
  Heading2Light,
  Heading3Light,
  ImageLight,
  QuoteLight,
  PlainTextLight,
  TwitterLight,
  CtaIcon,
} from '../../../../icons';
import { SlashCommandsCommand } from './slash-commands';

export const slashCommands: SlashCommandsCommand[] = [
  {
    icon: PlainTextLight,
    title: 'Plain Text',
    description: 'Normal paragraph style',
    section: 'basic',
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
    section: 'basic',
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
    section: 'basic',
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
    section: 'basic',
    command: ({ editor, range }) => {
      const input = document.createElement('input');
      input.type = 'file';
      input.accept = 'image/jpeg,image/png,image/gif';

      input.onchange = async (e) => {
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        const file: File | undefined = (e.target as any)?.files?.[0];
        if (!file) return;
        const [mime] = file.type.split('/');
        if (mime !== 'image') return;

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
    title: 'Bulleted list',
    description: 'Create a bulleted list',
    section: 'basic',
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
    section: 'basic',
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
    section: 'basic',
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
    section: 'basic',
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
    section: 'basic',
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
    section: 'embed',
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
    section: 'embed',
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
