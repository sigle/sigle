import TipTapImage from '@tiptap/extension-image';
import { ReactNodeViewRenderer } from '@tiptap/react';
import { Component } from './Component';

export const Image = TipTapImage.extend({
  addAttributes() {
    return {
      ...this.parent?.(),
      loading: {
        default: false,
        renderHTML: (attributes) => {
          if (attributes.loading) {
            return {
              'data-loading': attributes.loading,
            };
          }
        },
      },
      id: {
        default: false,
        renderHTML: () => ({}),
      },
    };
  },

  draggable: true,
  selectable: true,

  addNodeView() {
    return ReactNodeViewRenderer(Component);
  },
});
