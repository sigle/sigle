import { useState, useCallback, useEffect } from 'react';
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
  },
});

const PlusButton = styled('button', {
  display: 'flex',
  transitionProperty: 'color',
  transitionTimingFunction: 'cubic-bezier(0.4, 0, 0.2, 1)',
  transitionDuration: '150ms',
  color: '$gray9',
  '&:hover': {
    color: '$gray11',
  },

  variants: {
    open: {
      true: {
        // For now rotate is disabled because it doesn't work well. It's
        // creating a glitch when you close the menu and the icon is moving
        // by 2px on the right side.
        // transform: 'rotate(45deg)',
      },
    },
  },
});

interface FloatingMenuProps {
  editor: Editor;
  storyId: string;
}

export const FloatingMenu = ({ editor, storyId }: FloatingMenuProps) => {
  globalStylesCustomEditor();

  const [isOpen, setIsOpen] = useState(false);
  const [width, setWidth] = useState(window.innerWidth);

  useEffect(() => {
    window.addEventListener('resize', () => setWidth(window.innerWidth));
  }, []);

  const handleButtonClick = () => {
    setIsOpen(!isOpen);
  };

  const handleSelect = useCallback(
    ({ command }: any) => {
      command({ editor });
      setIsOpen(false);
    },
    [editor]
  );

  return (
    <>
      {width > 1024 ? (
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
          <Tippy
            content={
              <CommandsListController
                component={SlashCommandsList}
                items={slashCommands({ storyId })}
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
      ) : null}
    </>
  );
};
