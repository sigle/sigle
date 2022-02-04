import { useState, useCallback } from 'react';
import { Editor, FloatingMenu as TipTapFloatingMenu } from '@tiptap/react';
import Tippy from '@tippyjs/react';
import { Flex } from '../../ui';
import { globalCss } from '../../stitches.config';
import { RoundPlus } from '../../icons';
import { CommandsListController } from './extensions/SlashCommands';
import { SlashCommandsList, slashCommands } from './InlineMenu';

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

  const [isOpen, setIsOpen] = useState(false);

  const handleButtonClick = () => {
    setIsOpen(!isOpen);
  };

  const handleSelect = useCallback(
    ({ command }) => {
      command({ editor });
      setIsOpen(false);
    },
    [editor]
  );

  return (
    <>
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
          return (
            editor.isActive('paragraph') && empty && node.content.size === 0
          );
        }}
      >
        <Tippy
          content={
            <CommandsListController
              component={SlashCommandsList}
              items={slashCommands}
              command={handleSelect}
            />
          }
          visible={isOpen}
          placement="right-end"
          theme="sigle-editor"
          arrow={false}
          interactive
          appendTo={() => document.body}
          onClickOutside={handleButtonClick}
        >
          <Flex as="button" onClick={handleButtonClick}>
            <RoundPlus width={27} height={27} />
          </Flex>
        </Tippy>
      </TipTapFloatingMenu>
    </>
  );
};
