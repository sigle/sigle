import { useState } from 'react';
import { Editor, FloatingMenu as TipTapFloatingMenu } from '@tiptap/react';
import { PlusCircledIcon, CrossCircledIcon } from '@radix-ui/react-icons';
import { Box } from '../../ui';

interface FloatingMenuProps {
  editor: Editor;
}

export const FloatingMenu = ({ editor }: FloatingMenuProps) => {
  const [menuOpen, setMenuOpen] = useState(false);

  return (
    <TipTapFloatingMenu
      editor={editor}
      pluginKey="inline-add-menu"
      tippyOptions={{ theme: 'light-border' }}
      shouldShow={({ editor, state }) => {
        // Show only on empty blocks
        const empty = state.selection.empty;
        const node = state.selection.$head.node();
        return editor.isActive('paragraph') && empty && node.content.size === 0;
      }}
    >
      <Box css={{ position: 'absolute', top: 5, left: -46, color: '$gray11' }}>
        {/* TODO animation */}
        <button onClick={() => setMenuOpen(!menuOpen)}>
          {!menuOpen ? (
            <PlusCircledIcon width={24} height={24} />
          ) : (
            <CrossCircledIcon width={24} height={24} />
          )}
        </button>
      </Box>

      {menuOpen ? <div>Heya</div> : null}
    </TipTapFloatingMenu>
  );
};
