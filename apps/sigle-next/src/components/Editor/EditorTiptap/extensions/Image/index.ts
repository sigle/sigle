import TipTapImageBase from '@tiptap/extension-image';
import { ReactNodeViewRenderer } from '@tiptap/react';
import { findChildren } from '@tiptap/core';
import { Plugin, PluginKey } from '@tiptap/pm/state';
import { nanoid } from 'nanoid';
import { Component } from './ImageWrapper';

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

            images.forEach((imageFile, idx) => {
              const [mime, extension] = imageFile.type.split('/');
              const accepted = ['jpeg', 'png', 'gif'];
              if (!accepted.includes(extension)) {
                return;
              }
              if (mime !== 'image') return;
              const src = URL.createObjectURL(imageFile);
              const id = nanoid();

              const coordinates = view.posAtCoords({
                left: event.clientX,
                top: event.clientY,
              });

              if (!coordinates) {
                return;
              }

              editor.commands.insertContentAt(coordinates.pos, {
                type: 'image',
                attrs: {
                  src,
                  id,
                  loading: true,
                },
              });

              const upload = async () => {
                // Extract the post ID from the URL
                const postId = window.location.pathname.split('/')[2];

                // Upload the image to the API so it can be processed
                var formData = new FormData();
                formData.append('file', imageFile);
                formData.append('postId', postId);

                const response = await fetch(`/api/image-upload`, {
                  method: 'POST',
                  body: formData,
                });
                // TODO try catch notification error
                const json = await response.json();

                return { imageUrl: json.gatewayUrl, url: json.url };
              };

              upload().then(({ imageUrl, url }) => {
                const uploadedImage = new Image();
                uploadedImage.src = imageUrl;
                uploadedImage.onload = () => {
                  editor.commands.command(({ tr }) => {
                    const doc = view.state.tr.doc;
                    const images = findChildren(
                      doc,
                      (node) =>
                        node.type.name === 'image' && node.attrs.id === id,
                    );
                    const image = images[0];

                    if (!image || images.length > 1) {
                      return false;
                    }

                    tr.setNodeMarkup(image.pos, undefined, {
                      ...image.node.attrs,
                      src: url,
                      loading: false,
                    });

                    return true;
                  });

                  if (idx == images.length - 1) {
                    editor.commands.createParagraphNear();
                  }
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
