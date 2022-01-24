import { useRef } from 'react';
import { useEditor, EditorContent } from '@tiptap/react';
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
import TipTapImage from '@tiptap/extension-image';
import TipTapLink from '@tiptap/extension-link';
import TipTapListItem from '@tiptap/extension-list-item';
import TipTapOrderedList from '@tiptap/extension-ordered-list';
import TipTapParagraph from '@tiptap/extension-paragraph';
import TipTapPlaceholder from '@tiptap/extension-placeholder';
import TipTapStrike from '@tiptap/extension-strike';
import TipTapText from '@tiptap/extension-text';
import {
  SlashCommands,
  SlashCommandsCommand,
} from './extensions/SlashCommands';
import { BubbleMenu } from './BubbleMenu';
import { slashCommands, SlashCommandsList } from './InlineMenu';
import { FloatingMenu } from './FloatingMenu';
import {
  Heading1Light,
  Heading2Light,
  Heading3Light,
  ImageLight,
  QuoteLight,
} from '../../icons';
import { generateRandomId } from '../../utils';
import { resizeImage } from '../../utils/image';
import { storage } from '../../utils/blockstack';
import { Story } from '../../types';
import { styled, globalCss, keyframes } from '../../stitches.config';

const fadeInAnimation = keyframes({
  '0%': { opacity: '0' },
  '100%': { opacity: '1' },
});

const StyledEditorContent = styled(EditorContent, {
  '& .ProseMirror': {
    py: '$4',
    minHeight: 150,
  },
  '& .ProseMirror-focused': {
    outline: 'none',
  },
  // Placeholder plugin style
  '& .ProseMirror p.is-empty::before': {
    content: 'attr(data-placeholder)',
    float: 'left',
    color: '#bbbaba',
    pointerEvents: 'none',
    height: 0,
    animation: `${fadeInAnimation} 75ms cubic-bezier(0, 0, 0.2, 1)`,
  },
  // Image selected style
  '& img.ProseMirror-selectednode': {
    outline: '1px solid $orange11',
  },
});

// Tippyjs theme used by the slash command menu
const globalStylesCustomEditor = globalCss({
  ".tippy-box[data-theme~='sigle-editor'] .tippy-content": {
    padding: 0,
    backgroundColor: '$gray1',
    boxShadow:
      '0 4px 6px -1px rgb(0 0 0 / 0.1), 0 2px 4px -2px rgb(0 0 0 / 0.1)',
    br: '$1',
    minWidth: '280px',
  },
});

/**
 * TODO
 * - left menu that trigger the commands menu
 * - check all the shortcuts and update the GitBook
 * - check all the markdown shorcuts
 * - investigate figure extension instead of image
 * - separate PR - mobile UI
 * - WIP separate PR - data migration from slate
 */

interface TipTapEditorProps {
  // story: Story;
}

export const TipTapEditor = ({}: TipTapEditorProps) => {
  globalStylesCustomEditor();

  const fileUploaderRef = useRef<HTMLInputElement>(null);

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
      TipTapImage,
      // Marks
      TipTapBold,
      TipTapCode,
      TipTapItalic,
      TipTapStrike,
      // Extensions
      TipTapDropcursor,
      TipTapHistory,
      TipTapPlaceholder.configure({
        placeholder: ({ editor }) => {
          const currentPos = editor.state.selection.$anchor.pos;
          return currentPos === 1
            ? 'Start your story here...'
            : "Type '/' for commands";
        },
      }),
      // Custom extensions
      SlashCommands.configure({
        commands: slashCommands,
        component: SlashCommandsList,
      }),
    ],
    content: '<p>Hello World! 🌎️</p>',
  });

  const addImageToEditor = (files: FileList | null) => {
    if (!files) {
      return;
    }

    // for (const file of files) {
    //   const reader = new FileReader();
    //   const [mime] = file.type.split('/');
    //   if (mime !== 'image') continue;

    //   // First show the image as uploading since this can take a while...
    //   const preview = URL.createObjectURL(file);
    //   const id = generateRandomId();

    //   // TODO global loading state ?

    //   // editor?.chain().focus().setImage({ src: preview }).run();

    //   reader.addEventListener('load', async () => {
    //     // resize the image for faster upload
    //     const blob = await resizeImage(file, { maxWidth: 2000 });

    //     const name = `photos/${story.id}/${id}-${file.name}`;
    //     const imageUrl = await storage.putFile(name, blob as any, {
    //       encrypt: false,
    //       contentType: file.type,
    //     });

    //     // editor?.state.tr.deleteSelection();

    //     // TODO image should delete slash menu text and appear at the same place
    //     editor?.chain().focus().setImage({ src: imageUrl }).run();
    //   });

    //   reader.readAsDataURL(file);
    // }
  };

  return (
    <>
      {editor && <BubbleMenu editor={editor} />}
      {/* {editor && <FloatingMenu editor={editor} />} */}

      <StyledEditorContent editor={editor} />

      {/* Input used to accept images */}
      <input
        type="file"
        accept="image/jpeg, image/png"
        onChange={(event) => addImageToEditor(event.target.files)}
        ref={fileUploaderRef}
        style={{ display: 'none' }}
      />
    </>
  );
};
