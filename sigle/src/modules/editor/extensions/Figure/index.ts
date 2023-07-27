import { Node, nodeInputRule } from '@tiptap/core';
import { ReactNodeViewRenderer } from '@tiptap/react';
import { Plugin, PluginKey, TextSelection } from '@tiptap/pm/state';
import { FigureComponent } from './FigureComponent';
import { generateRandomId } from '../../../../utils';

export interface FigureOptions {
  HTMLAttributes: Record<string, any>;

  /**
   * Upload a file and return the URL.
   */
  uploadFile: (file: File) => Promise<string>;
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
        caption?: string;
      }) => ReturnType;

      setFigureFromFile: (options: { file: File }) => ReturnType;
    };
  }
}

export const inputRegex = /!\[(.+|:?)]\((\S+)(?:(?:\s+)["'](\S+)["'])?\)/;

export const TipTapFigure = Node.create<FigureOptions>({
  name: 'figure',

  addOptions() {
    return {
      ...this.parent?.(),
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

      // Attribute used to store a temporary ID while the file is uploaded.
      uploadId: {
        default: null,
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
      ['img', HTMLAttributes],
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

      setFigureFromFile:
        ({ file }) =>
        ({ chain, editor }) => {
          const uploadId = generateRandomId();
          // We show a preview of  the image image as uploading can take a while.
          const preview = URL.createObjectURL(file);

          chain()
            .insertContent({
              type: this.name,
              attrs: { uploadId, src: preview },
            })
            .run();

          this.options.uploadFile(file).then((imageUrl) => {
            // Once the file is uploaded, we preload it so there is no flickering.
            const image = new Image();
            image.src = imageUrl;
            image.onload = () => {
              const transaction = editor.state.tr;
              editor.state.doc.descendants((node, pos) => {
                if (
                  node.type.name === 'figure' &&
                  node.attrs.uploadId === uploadId
                ) {
                  const attrs = {
                    ...node.attrs,
                    src: imageUrl,
                    uploadId: undefined,
                  };
                  const newNode = node.type.create(
                    attrs,
                    node.content,
                    node.marks,
                  );
                  transaction.replaceWith(pos, pos + node.nodeSize, newNode);
                }
              });
              editor.view.dispatch(transaction);
            };
          });

          return true;
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
              newParagraph,
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
          const [, src, alt] = match;

          return { src, alt };
        },
      }),
    ];
  },

  addProseMirrorPlugins() {
    const { editor, options } = this;

    return [
      new Plugin({
        key: new PluginKey('figureDropHandler'),
        props: {
          handleDrop(view, event: DragEvent) {
            const hasFiles =
              event &&
              event?.dataTransfer?.files &&
              event?.dataTransfer?.files?.length > 0;

            event.preventDefault();

            if (!hasFiles) {
              // returning false ensures already uploaded images can be dragged to reorder
              return false;
            }

            const coordinates = view.posAtCoords({
              left: event.clientX,
              top: event.clientY,
            });

            if (!coordinates) {
              return;
            }

            // Get the file from the event.
            const imageFile = event.dataTransfer.files[0];
            const [mime, extension] = imageFile.type.split('/');
            const accepted = ['jpeg', 'png', 'gif'];
            if (!accepted.includes(extension)) {
              return;
            }
            if (mime !== 'image') return;

            const uploadId = generateRandomId();
            // We show a preview of  the image image as uploading can take a while.
            const preview = URL.createObjectURL(imageFile);

            const figureNode = view.state.schema.nodes.figure.createAndFill({
              uploadId,
              src: preview,
            })!;
            const transaction = view.state.tr.insert(
              coordinates.pos,
              figureNode,
            );
            view.dispatch(transaction);

            options.uploadFile(imageFile).then((imageUrl) => {
              // Once the file is uploaded, we preload it so there is no flickering.
              const image = new Image();
              image.src = imageUrl;
              image.onload = () => {
                const transaction = editor.state.tr;
                editor.state.doc.descendants((node, pos) => {
                  if (
                    node.type.name === 'figure' &&
                    node.attrs.uploadId === uploadId
                  ) {
                    const attrs = {
                      ...node.attrs,
                      src: imageUrl,
                      uploadId: undefined,
                    };
                    const newNode = node.type.create(
                      attrs,
                      node.content,
                      node.marks,
                    );
                    transaction.replaceWith(pos, pos + node.nodeSize, newNode);
                  }
                });
                editor.view.dispatch(transaction);
              };
            });

            return true;
          },
        },
      }),
    ];
  },
});
