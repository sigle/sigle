import { Editor, FloatingMenu as TipTapFloatingMenu } from '@tiptap/react';
import { TbPlus } from 'react-icons/tb';
import { globalCss } from '@sigle/stitches.config';
import { IconButton } from '@sigle/ui';

// Tippyjs theme used by the slash command menu
const globalStylesCustomEditor = globalCss({
  ".tippy-box[data-theme~='sigle-editor-floating-menu']": {
    backgroundColor: 'transparent',
  },
  ".tippy-box[data-theme~='sigle-editor-floating-menu'] .tippy-content": {
    backgroundColor: 'transparent',
    padding: 0,
  },
});

interface EditorFloatingMenuProps {
  editor: Editor;
  isMobile: boolean;
}

export const EditorFloatingMenu = ({
  editor,
  isMobile,
}: EditorFloatingMenuProps) => {
  globalStylesCustomEditor();

  const handleButtonClick = () => {
    editor.commands.insertContent('/');
    editor.commands.focus();
  };

  return (
    <TipTapFloatingMenu
      editor={editor}
      pluginKey="inline-add-menu"
      tippyOptions={{
        theme: 'sigle-editor-floating-menu',
        placement: 'left',
        arrow: false,
      }}
      shouldShow={({ editor, state }) => {
        if (isMobile) {
          return false;
        }

        // Show only on empty blocks
        const empty = state.selection.empty;
        const node = state.selection.$head.node();

        // This might be pretty heavy to do as it's run on every keypress
        // We should look into a different way to do it when we have more time
        const isNotAllowed =
          editor.isActive('bulletList') ||
          editor.isActive('orderedList') ||
          editor.isActive('blockquote');

        return (
          editor.isActive('paragraph') &&
          !isNotAllowed &&
          empty &&
          node.content.size === 0
        );
      }}
    >
      <IconButton size="sm" variant="ghost" onClick={handleButtonClick}>
        <TbPlus size={14} />
      </IconButton>
    </TipTapFloatingMenu>
  );
};
