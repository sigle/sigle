import TipTapImageBase from '@tiptap/extension-image';
import { ReactNodeViewRenderer } from '@tiptap/react';
import { findChildren } from '@tiptap/core';
import { Plugin, PluginKey } from 'prosemirror-state';
import { Component } from './ImageWrapper';
import { generateRandomId } from '../../../../utils';
import { resizeAndUploadImage } from '../../utils/image';

export const TipTapImage = TipTapImageBase.extend({
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

  addProseMirrorPlugins() {
    const { editor } = this;

    return [
      new Plugin({
        key: new PluginKey('imageDropHandler'),
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

            const images = Array.from(event.dataTransfer.files);

            const { schema } = view.state;

            const coordinates = view.posAtCoords({
              left: event.clientX,
              top: event.clientY,
            });

            images.forEach((file) => {
              const [mime] = file.type.split('/');
              if (mime !== 'image') return;
              const src = URL.createObjectURL(file);
              const id = generateRandomId();

              const node = schema.nodes.image.create({
                src,
                id,
                loading: true,
              });

              if (!coordinates) {
                return;
              }

              const transaction = view.state.tr.insert(coordinates.pos, node);

              view.dispatch(transaction);

              const upload = async () => {
                const name = file.name;
                const imageUrl = await resizeAndUploadImage(file, name);
                return imageUrl;
              };

              upload().then((url) => {
                const uploadedImage = new Image();
                uploadedImage.src = url;
                uploadedImage.onload = () => {
                  const doc = view.state.tr.doc;
                  const images = findChildren(
                    doc,
                    (node) => node.type.name === 'image' && node.attrs.id === id
                  );
                  const image = images[0];

                  if (!image || images.length > 1) {
                    return false;
                  }

                  const loadedImage = view.state.tr.setNodeMarkup(
                    image.pos,
                    undefined,
                    {
                      ...node.attrs,
                      src: url,
                      loading: false,
                    }
                  );

                  editor.commands.createParagraphNear();

                  view.dispatch(loadedImage);
                };
              });
            });

            return true;
          },
        },
      }),
    ];
  },
});
