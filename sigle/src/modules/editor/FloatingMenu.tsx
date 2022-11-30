import { Editor, FloatingMenu as TipTapFloatingMenu } from '@tiptap/react';
import { globalCss } from '../../stitches.config';
import { PlusIcon } from '@radix-ui/react-icons';
import { IconButton } from '../../ui';

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

interface FloatingMenuProps {
  editor: Editor;
}

export const FloatingMenu = ({ editor }: FloatingMenuProps) => {
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
        // Should never show when read-only mode is enabled
        if (!editor.isEditable) {
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
        <PlusIcon width={14} height={14} />
      </IconButton>
    </TipTapFloatingMenu>
  );
};
