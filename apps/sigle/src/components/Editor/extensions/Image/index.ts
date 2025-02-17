import TipTapImageBase, { type ImageOptions } from "@tiptap/extension-image";
import { ReactNodeViewRenderer } from "@tiptap/react";
import { nanoid } from "nanoid";
import { ImageComponent } from "./Component";

declare module "@tiptap/core" {
  interface Commands<ReturnType> {
    customImage: {
      /**
       * Add an image
       */
      setImage: (options: {
        src: string;
        alt?: string;
        title?: string;
      }) => ReturnType;

      setImageFromFile: (options: { file: File }) => ReturnType;
    };
  }
}

export const TipTapImage = TipTapImageBase.extend<
  ImageOptions & {
    /**
     * Upload a file and return the URL.
     */
    uploadFile: (file: File) => Promise<string>;
  }
>({
  draggable: true,

  selectable: true,

  addAttributes() {
    return {
      ...this.parent?.(),

      // Attribute used to store a temporary ID while the file is uploaded.
      uploadId: {
        default: null,
      },
    };
  },

  addNodeView() {
    return ReactNodeViewRenderer(ImageComponent);
  },

  addCommands() {
    return {
      setImageFromFile:
        ({ file }) =>
        ({ chain, editor }) => {
          const uploadId = nanoid();
          // We show a preview of  the image image as uploading can take a while.
          const preview = URL.createObjectURL(file);

          chain()
            .insertContent({
              type: this.name,
              attrs: { uploadId, src: preview },
            })
            .run();

          this.options
            .uploadFile(file)
            .then((imageUrl) => {
              // The file can take some time to propagate to IPFS. So we keep the local preview of the file
              const transaction = editor.state.tr;
              editor.state.doc.descendants((node, pos) => {
                if (
                  node.type.name === "image" &&
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
            })
            .catch((error) => {
              // If the upload fails, we remove the image node from the document
              console.error("Failed to upload image", error);
              const transaction = editor.state.tr;
              editor.state.doc.descendants((node, pos) => {
                if (
                  node.type.name === "image" &&
                  node.attrs.uploadId === uploadId
                ) {
                  transaction.delete(pos, pos + node.nodeSize);
                }
              });
              editor.view.dispatch(transaction);
            });

          return true;
        },
    };
  },
});
