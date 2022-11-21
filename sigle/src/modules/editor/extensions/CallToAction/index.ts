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

export const Cta = Node.create<{}>({
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
        parseHTML: (element) => element.textContent,
      },
      url: {
        default: null,
        parseHTML: (element) => element.parentElement?.getAttribute('href'),
      },
      size: {
        default: null,
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
        tag: 'a[data-type="button-cta"] button',
      },
    ];
  },

  renderHTML({ HTMLAttributes }) {
    return [
      'a',
      { 'data-type': 'button-cta', href: HTMLAttributes.url },
      [
        'button',
        mergeAttributes(HTMLAttributes, {
          url: undefined,
          label: undefined,
        }),
        HTMLAttributes.label,
      ],
    ];
  },

  addNodeView() {
    return ReactNodeViewRenderer(CtaComponent);
  },
});
