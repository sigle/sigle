// https://github.com/ueberdosis/tiptap/issues/1508#issuecomment-877348787

import { Extension } from '@tiptap/core';
import Suggestion, { SuggestionOptions } from '@tiptap/suggestion';
import { Editor } from '@tiptap/core';
import { ReactRenderer, Range } from '@tiptap/react';
import tippy, { Instance } from 'tippy.js';
import type { IconBaseProps } from 'react-icons';
import { CommandList, CommandListRef } from './CommandList';

export interface SlashCommandsCommand {
  title: string;
  description: string;
  section: 'basic' | 'embed';
  icon: (props: IconBaseProps) => JSX.Element;
  command: ({ editor, range }: { editor: Editor; range?: Range }) => void;
}

export const SlashCommands = Extension.create<{
  commands: SlashCommandsCommand[];
  filterCommands: (
    commands: SlashCommandsCommand[],
    query: string,
  ) => SlashCommandsCommand[];
  suggestion: Partial<SuggestionOptions>;
}>({
  name: 'slash-command',

  addOptions() {
    return {
      commands: [],
      filterCommands: (commands, query) => {
        return (
          commands
            .filter((item) =>
              item.title.toLowerCase().startsWith(query.toLowerCase()),
            )
            // When user is filtering, only show 10 results
            .slice(0, query.length > 0 ? 10 : 20)
        );
      },
      suggestion: {
        char: '/',
        startOfLine: true,
      },
    };
  },

  addProseMirrorPlugins() {
    return [
      Suggestion({
        editor: this.editor,
        ...this.options.suggestion,
        items: (query) =>
          this.options.filterCommands(this.options.commands, query.query),
        command: ({ editor, range, props }) => {
          props.command({ editor, range });
        },
        render: () => {
          let reactRenderer: ReactRenderer<CommandListRef>;
          let popup: Instance[];

          return {
            onStart: (props) => {
              reactRenderer = new ReactRenderer(CommandList, {
                props,
                editor: props.editor,
              });

              popup = tippy('body', {
                getReferenceClientRect: props.clientRect as any,
                appendTo: () => document.body,
                content: reactRenderer.element,
                showOnCreate: true,
                interactive: true,
                trigger: 'manual',
                placement: 'bottom-start',
                theme: 'sigle-editor',
                arrow: false,
              });
            },
            onUpdate: (props) => {
              reactRenderer.updateProps(props);

              popup[0].setProps({
                getReferenceClientRect: props.clientRect as any,
              });
            },
            onKeyDown(props) {
              if (props.event.key === 'Escape') {
                popup[0].hide();
                return true;
              }

              return reactRenderer?.ref?.onKeyDown(props) ?? false;
            },
            onExit() {
              popup[0].destroy();
              reactRenderer.destroy();
            },
          };
        },
      }),
    ];
  },
});
