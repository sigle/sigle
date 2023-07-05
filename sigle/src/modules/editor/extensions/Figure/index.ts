import { mergeAttributes, Node, nodeInputRule } from '@tiptap/core';
import { ReactNodeViewRenderer } from '@tiptap/react';
import { TextSelection } from '@tiptap/pm/state';
import { FigureComponent } from './FigureComponent';

// TODO upload image code should be in only one place
// TODO loading state
// TODO alt text editing
// TODO see how to convert old images to new figure

export interface FigureOptions {
  HTMLAttributes: Record<string, any>;
}

declare module '@tiptap/core' {
  interface Commands<ReturnType> {
    figure: {
      /**
       * Add a figure element
       */
      setFigure: (options: {
        src: string;
        alt?: string;
        title?: string;
        caption?: string;
      }) => ReturnType;
    };
  }
}

export const inputRegex = /!\[(.+|:?)]\((\S+)(?:(?:\s+)["'](\S+)["'])?\)/;

export const TipTapFigure = Node.create<FigureOptions>({
  name: 'figure',

  addOptions() {
    return {
      HTMLAttributes: {},
    };
  },

  group: 'block',

  content: 'inline*',

  draggable: true,

  isolating: true,

  addNodeView() {
    return ReactNodeViewRenderer(FigureComponent);
  },

  addAttributes() {
    return {
      src: {
        default: null,
        parseHTML: (element) =>
          element.querySelector('img')?.getAttribute('src'),
      },

      alt: {
        default: null,
        parseHTML: (element) =>
          element.querySelector('img')?.getAttribute('alt'),
      },

      title: {
        default: null,
        parseHTML: (element) =>
          element.querySelector('img')?.getAttribute('title'),
      },
    };
  },

  parseHTML() {
    return [
      {
        tag: 'figure',
        contentElement: 'figcaption',
      },
    ];
  },

  renderHTML({ HTMLAttributes }) {
    return [
      'figure',
      this.options.HTMLAttributes,
      [
        'img',
        mergeAttributes(HTMLAttributes, {
          draggable: false,
          contenteditable: false,
        }),
      ],
      ['figcaption', 0],
    ];
  },

  addCommands() {
    return {
      setFigure:
        ({ caption, ...attrs }) =>
        ({ chain }) => {
          return (
            chain()
              .insertContent({
                type: this.name,
                attrs,
                content: caption ? [{ type: 'text', text: caption }] : [],
              })
              // set cursor at end of caption field
              .command(({ tr, commands }) => {
                const { doc, selection } = tr;
                const position = doc.resolve(selection.to - 2).end();

                return commands.setTextSelection(position);
              })
              .run()
          );
        },
    };
  },

  addKeyboardShortcuts() {
    return {
      /**
       * When pressing Enter, insert a new paragraph after, if the cursor is at the end of the figcaption.
       */
      Enter: ({ editor }) => {
        const { state } = editor;
        const { $from, $to, empty } = state.selection;
        // Get the current node type.
        const currentNodeType = $from.node().type;
        // If the current node is a 'figure' node and cursor is at the end of the text.
        if (
          currentNodeType.name === 'figure' &&
          empty &&
          $to.pos === $from.end()
        ) {
          // Calculate the replacement position.
          const replacePos = $from.after();
          if (replacePos <= state.doc.content.size) {
            const newParagraph = state.schema.nodes.paragraph.create();
            // Create a transaction to replace an empty text node right after the figure with the new paragraph.
            const tr = state.tr.replaceWith(
              replacePos,
              replacePos,
              newParagraph
            );
            // Set the focus on the new paragraph.
            tr.setSelection(TextSelection.create(tr.doc, replacePos + 1));
            // Dispatch the transaction.
            editor.view.dispatch(tr);
            return true;
          }
        }
        return false;
      },
    };
  },

  addInputRules() {
    return [
      nodeInputRule({
        find: inputRegex,
        type: this.type,
        getAttributes: (match) => {
          const [, src, alt, title] = match;

          return { src, alt, title };
        },
      }),
    ];
  },
});
