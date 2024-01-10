import { Node, mergeAttributes } from '@tiptap/core';
import { ReactNodeViewRenderer } from '@tiptap/react';
import { CtaComponent } from './component';

declare module '@tiptap/core' {
  interface Commands<ReturnType> {
    cta: {
      setCta: () => ReturnType;
    };
  }
}

const Cta = Node.create({
  name: 'cta',
  group: 'block',
  selectable: true,
  draggable: true,

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
        default: 'md',
        parseHTML: (element) => element.getAttribute('data-size'),
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
          size: undefined,
          'data-size': HTMLAttributes.size,
        }),
        HTMLAttributes.label || '',
      ],
    ];
  },

  addNodeView() {
    return ReactNodeViewRenderer(CtaComponent);
  },
});

export { Cta as TipTapCta };
