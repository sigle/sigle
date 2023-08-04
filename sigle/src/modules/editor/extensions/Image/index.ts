import TipTapImageBase from '@tiptap/extension-image';
import { ReactNodeViewRenderer } from '@tiptap/react';
import { Component } from './ImageWrapper';

export const TipTapImage = TipTapImageBase.extend({
  addAttributes() {
    return {
      ...this.parent?.(),
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
