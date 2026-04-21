import "./style.css";
import type { IconProps } from "@tabler/icons-react";
import {
  autoUpdate,
  computePosition,
  flip,
  offset,
  type VirtualElement,
} from "@floating-ui/dom";
import { type Editor, Extension } from "@tiptap/core";
import { type Range, ReactRenderer } from "@tiptap/react";
import Suggestion, { type SuggestionOptions } from "@tiptap/suggestion";
import { CommandList, type CommandListRef } from "./CommandList";

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
          let reactRenderer: ReactRenderer<CommandListRef> | null = null;
          let container: HTMLDivElement | null = null;
          let cleanup: (() => void) | null = null;

          const getVirtualElement = (
            clientRect: (() => DOMRect | null) | null | undefined,
          ): VirtualElement => ({
            getBoundingClientRect: () => {
              const rect = clientRect?.();
              return (
                rect ?? {
                  x: 0,
                  y: 0,
                  width: 0,
                  height: 0,
                  top: 0,
                  right: 0,
                  bottom: 0,
                  left: 0,
                }
              );
            },
          });

          const updatePosition = (
            clientRect: (() => DOMRect | null) | null | undefined,
          ) => {
            if (!container) return;
            const virtualEl = getVirtualElement(clientRect);
            computePosition(virtualEl, container, {
              placement: "bottom-start",
              middleware: [offset(4), flip()],
            }).then(({ x, y }) => {
              if (!container) return;
              Object.assign(container.style, {
                left: `${x}px`,
                top: `${y}px`,
              });
            });
          };

          return {
            onStart: (props) => {
              reactRenderer = new ReactRenderer(CommandList, {
                props,
                editor: props.editor,
              });

              container = document.createElement("div");
              container.classList.add("slash-command-popup");
              container.style.position = "absolute";
              container.style.zIndex = "50";
              container.appendChild(reactRenderer?.element as HTMLElement);

              const appendTo =
                document.getElementsByClassName("root")[0] ?? document.body;
              appendTo.appendChild(container);

              updatePosition(props.clientRect);
              const virtualEl = getVirtualElement(props.clientRect);
              cleanup = autoUpdate(virtualEl, container, () =>
                updatePosition(props.clientRect),
              );
            },
            onUpdate: (props) => {
              reactRenderer?.updateProps(props);
              cleanup?.();
              updatePosition(props.clientRect);
              if (container) {
                const virtualEl = getVirtualElement(props.clientRect);
                cleanup = autoUpdate(virtualEl, container, () =>
                  updatePosition(props.clientRect),
                );
              }
            },
            onKeyDown(props) {
              if (props.event.key === "Escape") {
                return true;
              }

              return reactRenderer?.ref?.onKeyDown(props) ?? false;
            },
            onExit() {
              cleanup?.();
              if (container) {
                container.remove();
                container = null;
              }
              reactRenderer?.destroy();
            },
          };
        },
      }),
    ];
  },
});
