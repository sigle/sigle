import { Extension, findChildren } from '@tiptap/core';
import { Plugin, PluginKey } from 'prosemirror-state';
import { generateRandomId } from '../../../../utils';
import { resizeAndUploadImage } from '../../utils/image';

export const ImageDrop = Extension.create({
  name: 'ImageDropHandler',

  addProseMirrorPlugins() {
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
                  console.log(image);

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
