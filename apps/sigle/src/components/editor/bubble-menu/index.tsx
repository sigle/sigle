import {
  Editor,
  BubbleMenu as TipTapBubbleMenu,
  isTextSelection,
} from '@tiptap/react';
import { useEffect } from 'react';
import {
  IconBold,
  IconCode,
  IconItalic,
  IconLink,
  IconStrikethrough,
  IconUnderline,
} from '@tabler/icons-react';
import { cn } from '@/lib/cn';
import { EditorBubbleMenuLink } from './bubble-menu-link';
import { useBubbleMenuStore } from './store';
import './style.css';

const BubbleMenuButton = ({
  active,
  ...props
}: { active: boolean } & React.ButtonHTMLAttributes<HTMLButtonElement>) => (
  <button
    {...props}
    className={cn({
      ['text-gray-1']: !active,
      ['text-indigo-7 dark:text-indigo-9']: active,
    })}
  />
);

interface EditorBubbleMenuProps {
  editor: Editor;
}

export const EditorBubbleMenu = ({ editor }: EditorBubbleMenuProps) => {
  // globalStylesBubbleMenu();
  const linkOpen = useBubbleMenuStore((state) => state.linkOpen);
  const setLinkValue = useBubbleMenuStore((state) => state.setLinkValue);
  const toggleLink = useBubbleMenuStore((state) => state.toggleLink);

  // Listen to any key press to detect cmd + k and activate the link edition
  useEffect(() => {
    function onKeyDown(event: KeyboardEvent) {
      // We want all our commands to start with the user pressing ctrl or cmd for mac users
      if ((event.ctrlKey || event.metaKey) && event.key === 'k') {
        onSelectLink();
      }
    }

    window.addEventListener('keydown', onKeyDown);
    return () => window.removeEventListener('keydown', onKeyDown);
  }, []);

  const onSelectLink = () => {
    // Get href of selected link to pre fill the input
    const existingHref = editor.isActive('link')
      ? editor.getAttributes('link').href
      : '';

    toggleLink(true);
    setLinkValue(existingHref);
  };

  return (
    <TipTapBubbleMenu
      className="flex gap-3 px-4 py-3"
      tippyOptions={{
        duration: 100,
        theme: 'sigle-editor-bubble-menu',
      }}
      shouldShow={({ editor, state, from, to, view }) => {
        // Take the initial implementation of the plugin and extends it
        // https://github.com/ueberdosis/tiptap/blob/main/packages/extension-bubble-menu/src/bubble-menu-plugin.ts#L43
        const { doc, selection } = state;
        const { empty } = selection;
        // Sometime check for `empty` is not enough.
        // Doubleclick an empty paragraph returns a node size of 2.
        // So we check also for an empty text size.
        const isEmptyTextBlock =
          !doc.textBetween(from, to).length && isTextSelection(state.selection);

        if (!view.hasFocus() || empty || isEmptyTextBlock) {
          return false;
        }
        // End default implementation

        // Do not show menu on images
        if (editor.isActive('image')) {
          return false;
        }

        // Do not show menu on code blocks
        if (editor.isActive('codeBlock')) {
          return false;
        }

        // Do not show menu on dividers
        if (editor.isActive('horizontalRule')) {
          return false;
        }

        /// Do not show on twitter embed
        if (editor.isActive('twitter')) {
          return false;
        }

        /// Do not show on cta
        if (editor.isActive('cta')) {
          return false;
        }

        return true;
      }}
      editor={editor}
    >
      {!linkOpen ? (
        <>
          <BubbleMenuButton
            onClick={() => editor.chain().focus().toggleBold().run()}
            active={editor.isActive('bold')}
          >
            <IconBold size={18} />
          </BubbleMenuButton>
          <BubbleMenuButton
            onClick={() => editor.chain().focus().toggleItalic().run()}
            active={editor.isActive('italic')}
          >
            <IconItalic size={18} />
          </BubbleMenuButton>
          <BubbleMenuButton
            onClick={() => editor.chain().focus().toggleUnderline().run()}
            active={editor.isActive('underline')}
          >
            <IconUnderline size={18} />
          </BubbleMenuButton>
          <BubbleMenuButton
            onClick={() => editor.chain().focus().toggleStrike().run()}
            active={editor.isActive('strike')}
          >
            <IconStrikethrough size={18} />
          </BubbleMenuButton>
          <BubbleMenuButton
            onClick={() => editor.chain().focus().toggleCode().run()}
            active={editor.isActive('code')}
          >
            <IconCode size={18} />
          </BubbleMenuButton>
          <BubbleMenuButton
            onClick={() => onSelectLink()}
            active={editor.isActive('link')}
          >
            <IconLink size={18} />
          </BubbleMenuButton>
        </>
      ) : (
        <EditorBubbleMenuLink editor={editor} />
      )}
    </TipTapBubbleMenu>
  );
};
