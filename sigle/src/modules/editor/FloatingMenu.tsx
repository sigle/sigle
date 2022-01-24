import { Editor, FloatingMenu as TipTapFloatingMenu } from '@tiptap/react';
import { Flex } from '../../ui';
import { globalCss } from '../../stitches.config';
import { RoundPlus } from '../../icons';

// Tippyjs theme used by the slash command menu
const globalStylesCustomEditor = globalCss({
  ".tippy-box[data-theme~='sigle-editor-floating-menu']": {
    backgroundColor: 'transparent',
  },
  ".tippy-box[data-theme~='sigle-editor-floating-menu'] .tippy-content": {
    backgroundColor: 'transparent',
    padding: 0,
    color: '$gray9',
  },
});

interface FloatingMenuProps {
  editor: Editor;
}

export const FloatingMenu = ({ editor }: FloatingMenuProps) => {
  globalStylesCustomEditor();

  const handleButtonClick = () => {
    editor
      .chain()
      .focus()
      .command(({ tr }) => {
        // manipulate the transaction
        tr.insertText('/');

        return true;
      })
      .run();
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
        // Show only on empty blocks
        const empty = state.selection.empty;
        const node = state.selection.$head.node();

        return editor.isActive('paragraph') && empty && node.content.size === 0;
      }}
    >
      <Flex as="button" onClick={handleButtonClick}>
        <RoundPlus width={27} height={27} />
      </Flex>
    </TipTapFloatingMenu>
  );
};
