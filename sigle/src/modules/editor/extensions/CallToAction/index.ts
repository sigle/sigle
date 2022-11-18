import { Node, mergeAttributes } from '@tiptap/core';
import { ReactNodeViewRenderer } from '@tiptap/react';
import { CtaComponent } from './CtaComponent';

declare module '@tiptap/core' {
  interface Commands<ReturnType> {
    cta: {
      setCta: () => ReturnType;
    };
  }
}

export const Cta = Node.create({
  name: 'cta',
  group: 'block',
  selectable: true,
  draggable: true,

  addOptions() {
    return {
      addPasteHandler: true,
    };
  },

  addAttributes() {
    return {
      label: {
        default: null,
        // force correct id
        // parseHTML: (element) => element.getAttribute('data-cta'),
      },
      url: {
        default: null,
      },
      size: {
        default: null,
      },
      color: {
        default: null,
      },
      button: {
        default: false,
      },
    };
  },

  addCommands() {
    return {
      setCta:
        () =>
        ({ commands }) => {
          commands.insertContent({
            type: this.name,
          });
          return true;
        },
    };
  },

  parseHTML() {
    return [
      {
        tag: 'div[data-cta]',
      },
    ];
  },

  renderHTML({ HTMLAttributes }) {
    return ['div', mergeAttributes({ 'data-cta': '' }, HTMLAttributes)];
  },

  addNodeView() {
    return ReactNodeViewRenderer(CtaComponent);
  },
});
