import { useState, useCallback } from 'react';
import { Editor, FloatingMenu as TipTapFloatingMenu } from '@tiptap/react';
import Tippy from '@tippyjs/react';
import { globalCss, styled } from '../../stitches.config';
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

const PlusButton = styled('button', {
  display: 'flex',
  transitionProperty: 'transform',
  transitionTimingFunction: 'cubic-bezier(0.4, 0, 0.2, 1)',
  transitionDuration: '150ms',

  variants: {
    open: {
      true: {
        transform: 'rotate(45deg)',
      },
    },
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

          // TODO currently shows on any node, but should only show on empty paragraph blocks
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
          <PlusButton open={isOpen} onClick={handleButtonClick}>
            <RoundPlus width={27} height={27} />
          </PlusButton>
        </Tippy>
      </TipTapFloatingMenu>
    </>
  );
};
