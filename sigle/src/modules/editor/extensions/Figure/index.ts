import { mergeAttributes, Node, nodeInputRule } from '@tiptap/core';
import { ReactNodeViewRenderer } from '@tiptap/react';
import { FigureComponent } from './FigureComponent';

// TODO selected state to delete image
// TODO alt text editing
// TODO press enter should create a new block
// TODO upload image code should be in only one place
// TODO loading state
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
