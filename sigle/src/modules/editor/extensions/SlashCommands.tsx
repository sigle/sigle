// https://github.com/ueberdosis/tiptap/issues/1508#issuecomment-877348787

import React from 'react';
import { Extension } from '@tiptap/core';
import Suggestion, { SuggestionOptions } from '@tiptap/suggestion';
import { Editor, ReactRenderer, Range } from '@tiptap/react';
import tippy, { Instance } from 'tippy.js';
import { IconProps } from '@radix-ui/react-icons/dist/types';

export interface SlashCommandsCommand {
  title: string;
  description: string;
  icon: (props: IconProps) => JSX.Element;
  command: ({ editor, range }: { editor: Editor; range: Range }) => void;
}

export const SlashCommands = Extension.create<{
  commands: SlashCommandsCommand[];
  filterCommands: (
    commands: SlashCommandsCommand[],
    query: string
  ) => SlashCommandsCommand[];
  component: any;
  suggestion: Partial<SuggestionOptions>;
}>({
  name: 'slash-command',

  addOptions() {
    return {
      commands: [],
      filterCommands: (commands, query) => {
        return commands
          .filter((item) =>
            item.title.toLowerCase().startsWith(query.toLowerCase())
          )
          .slice(0, 10);
      },
      component: null,
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
          let component: ReactRenderer;
          let popup: Instance[];

          return {
            onStart: (props) => {
              component = new ReactRenderer(CommandsListController, {
                editor: props.editor,
                props: { ...props, component: this.options.component },
              });

              popup = tippy('body', {
                getReferenceClientRect: props.clientRect,
                appendTo: () => document.body,
                content: component.element,
                showOnCreate: true,
                interactive: true,
                trigger: 'manual',
                placement: 'bottom-start',
                theme: 'sigle-editor',
                arrow: false,
              });
            },
            onUpdate: (props) => {
              component.updateProps({
                ...props,
                component: this.options.component,
              });

              popup[0].setProps({
                getReferenceClientRect: props.clientRect,
              });
            },
            onKeyDown(props) {
              return (component.ref as any)?.onKeyDown(props);
            },
            onExit() {
              popup[0].destroy();
              component.destroy();
            },
          };
        },
      }),
    ];
  },
});

class CommandsListController extends React.Component<
  { items: any[]; command: (item: any) => void; component: any },
  { selectedIndex: number }
> {
  constructor() {
    // @ts-ignore
    super();
    this.state = {
      selectedIndex: 0,
    };
    this.selectItem = this.selectItem.bind(this);
  }

  onKeyDown({ event }: any) {
    if (event.key === 'ArrowUp') {
      this.upHandler();
      return true;
    }

    if (event.key === 'ArrowDown') {
      this.downHandler();
      return true;
    }

    if (event.key === 'Enter') {
      this.enterHandler();
      return true;
    }

    return false;
  }

  upHandler() {
    this.setState({
      selectedIndex:
        (this.state.selectedIndex + this.props.items.length - 1) %
        this.props.items.length,
    });
  }

  downHandler() {
    this.setState({
      selectedIndex: (this.state.selectedIndex + 1) % this.props.items.length,
    });
  }

  enterHandler() {
    this.selectItem(this.state.selectedIndex);
  }

  selectItem(index: number) {
    const item = this.props.items[index];

    if (item) {
      this.props.command(item);
    }
  }

  componentDidUpdate(prevProps: any, prevState: any) {
    if (prevProps.items.length !== this.props.items.length) {
      this.setState({ selectedIndex: 0 });
    }
  }

  render() {
    const { items, component: Component } = this.props;
    const { selectedIndex } = this.state;

    return (
      <Component
        items={items}
        selectedIndex={selectedIndex}
        selectItem={this.selectItem}
      />
    );
  }
}
