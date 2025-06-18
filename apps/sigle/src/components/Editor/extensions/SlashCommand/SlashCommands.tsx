// https://github.com/ueberdosis/tiptap/issues/1508#issuecomment-877348787

import type { IconProps } from "@tabler/icons-react";
import type { Editor } from "@tiptap/core";
import { Extension } from "@tiptap/core";
import { type Range, ReactRenderer } from "@tiptap/react";
import Suggestion, { type SuggestionOptions } from "@tiptap/suggestion";
import tippy, { type Instance } from "tippy.js";
import { CommandList, type CommandListRef } from "./CommandList";
import "./style.css";

export interface SlashCommandsCommand {
  title: string;
  keywords?: string[];
  description: string;
  section: "basic" | "embed";
  icon: (props: IconProps) => React.ReactElement;
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
  name: "slash-command",

  addOptions() {
    return {
      commands: [],
      filterCommands: (commands, query) => {
        return (
          commands
            .filter(
              (item) =>
                item.title.toLowerCase().startsWith(query.toLowerCase()) ||
                (item.keywords || []).some((keyword) =>
                  keyword.toLowerCase().startsWith(query.toLowerCase()),
                ),
            )
            // When user is filtering, only show 10 results
            .slice(0, query.length > 0 ? 10 : 20)
        );
      },
      suggestion: {
        char: "/",
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

              popup = tippy("body", {
                // biome-ignore lint/suspicious/noExplicitAny: ok
                getReferenceClientRect: props.clientRect as any,
                appendTo: () =>
                  // biome-ignore lint/suspicious/noExplicitAny: ok
                  document.getElementsByClassName("radix-themes")[0] as any,
                content: reactRenderer.element,
                showOnCreate: true,
                interactive: true,
                trigger: "manual",
                placement: "bottom-start",
                theme: "sigle-editor",
                arrow: false,
              });
            },
            onUpdate: (props) => {
              reactRenderer.updateProps(props);

              popup[0]?.setProps({
                // biome-ignore lint/suspicious/noExplicitAny: ok
                getReferenceClientRect: props.clientRect as any,
              });
            },
            onKeyDown(props) {
              if (props.event.key === "Escape") {
                popup[0]?.hide();
                return true;
              }

              return reactRenderer?.ref?.onKeyDown(props) ?? false;
            },
            onExit() {
              popup[0]?.destroy();
              reactRenderer.destroy();
            },
          };
        },
      }),
    ];
  },
});
