import type { ImageOptions } from "@tiptap/extension-image";
import TipTapImageBase from "@tiptap/extension-image";
import { Plugin, PluginKey } from "@tiptap/pm/state";
import { ReactNodeViewRenderer } from "@tiptap/react";
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

      /**
       * Insert an image placeholder asking for the URL of an external image.
       */
      insertImageUrlInput: () => ReturnType;
    };
  }
}

export const TipTapImage = TipTapImageBase.extend<
  ImageOptions & {
    /**
     * Upload a file and return the URL. Unset when the user can't upload
     * images, such as on the free plan.
     */
    uploadFile?: (file: File) => Promise<string>;
    /**
     * Called when the user drops or pastes an image file without
     * `uploadFile`, such as to offer the free plan an upgrade.
     */
    onUploadUnavailable?: () => void;
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

  // Same as the base extension, except an image still waiting for its URL is
  // not part of the post content.
  renderMarkdown(node) {
    const src = node.attrs?.src ?? "";

    if (!src) {
      return "";
    }

    const alt = node.attrs?.alt ?? "";
    const title = node.attrs?.title ?? "";

    // Backslashes and parentheses are backslash-escaped so an unbalanced `)`
    // does not end the destination, and whitespace, which is never valid in a
    // URL, is encoded.
    const destination = src
      .replace(/[\\()]/g, "\\$&")
      .replace(/\s/g, encodeURIComponent);

    return title
      ? `![${alt}](${destination} "${title}")`
      : `![${alt}](${destination})`;
  },

  // Uploads the image files dropped or pasted in the editor.
  addProseMirrorPlugins() {
    const insertFiles = (files: Array<File>, position?: number) => {
      const { uploadFile, onUploadUnavailable } = this.options;

      if (!uploadFile) {
        onUploadUnavailable?.();

        return;
      }

      // Each insertion moves the selection after its image, so the files keep
      // their order.
      if (position !== undefined) {
        this.editor.commands.setTextSelection(position);
      }

      for (const file of files) {
        this.editor.chain().focus().setImageFromFile({ file }).run();
      }
    };

    return [
      ...(this.parent?.() ?? []),
      new Plugin({
        key: new PluginKey("imageFiles"),
        props: {
          handleDrop: (view, event) => {
            const files = getImageFiles(event.dataTransfer);

            // Moving an image already in the post carries no file, and is
            // left to ProseMirror.
            if (files.length === 0) {
              return false;
            }

            event.preventDefault();
            insertFiles(
              files,
              view.posAtCoords({ left: event.clientX, top: event.clientY })
                ?.pos,
            );

            return true;
          },
          handlePaste: (_view, event) => {
            // An image copied from a web page also comes with HTML linking to
            // it, which ProseMirror pastes as an image from that URL, and text
            // copied from a document can come with an image of itself.
            if (hasPastableHtml(event.clipboardData)) {
              return false;
            }

            const files = getImageFiles(event.clipboardData);

            if (files.length === 0) {
              return false;
            }

            insertFiles(files);

            return true;
          },
        },
      }),
    ];
  },

  addCommands() {
    return {
      insertImageUrlInput:
        () =>
        ({ commands }) =>
          commands.insertContent({ type: this.name }),

      setImageFromFile:
        ({ file }) =>
        ({ chain, editor }) => {
          const { uploadFile } = this.options;

          if (!uploadFile) {
            return false;
          }

          const uploadId = crypto.randomUUID();
          // We show a preview of  the image image as uploading can take a while.
          const preview = URL.createObjectURL(file);

          chain()
            .insertContent({
              type: this.name,
              attrs: { uploadId, src: preview },
            })
            .run();

          uploadFile(file)
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

  // This is required for the migration process from Gaia.
  // It can be removed once it's done.
  onCreate() {
    const { editor } = this;
    const { uploadFile } = this.options;

    const transaction = editor.state.tr;

    editor.state.doc.descendants((node, pos) => {
      // Without an uploader the Gaia images are kept as they are, instead of
      // being removed from the document when their upload fails.
      if (
        uploadFile &&
        node.type.name === "image" &&
        node.attrs.src?.startsWith("https://gaia.blockstack.org/hub/")
      ) {
        const uploadId = crypto.randomUUID();

        const attrs = {
          ...node.attrs,
          uploadId,
        };

        const newNode = node.type.create(attrs, node.content, node.marks);
        transaction.replaceWith(pos, pos + node.nodeSize, newNode);

        fetch(node.attrs.src)
          .then((response) => response.blob())
          .then((blob) => {
            const file = new File([blob], "image", { type: blob.type });

            return uploadFile(file);
          })
          .then((imageUrl) => {
            const updateTransaction = editor.state.tr;
            editor.state.doc.descendants((innerNode, innerPos) => {
              if (
                innerNode.type.name === "image" &&
                innerNode.attrs.uploadId === uploadId
              ) {
                const updatedAttrs = {
                  ...innerNode.attrs,
                  src: imageUrl,
                  uploadId: undefined,
                };

                const updatedNode = innerNode.type.create(
                  updatedAttrs,
                  innerNode.content,
                  innerNode.marks,
                );

                updateTransaction.replaceWith(
                  innerPos,
                  innerPos + innerNode.nodeSize,
                  updatedNode,
                );
              }
            });
            editor.view.dispatch(updateTransaction);
          })
          .catch((error) => {
            console.error("Failed to upload image", error);
            const deleteTransaction = editor.state.tr;
            editor.state.doc.descendants((innerNode, innerPos) => {
              if (
                innerNode.type.name === "image" &&
                innerNode.attrs.uploadId === uploadId
              ) {
                deleteTransaction.delete(
                  innerPos,
                  innerPos + innerNode.nodeSize,
                );
              }
            });
            editor.view.dispatch(deleteTransaction);
          });
      }
    });

    editor.view.dispatch(transaction);
  },
});

/**
 * Whether ProseMirror can paste the HTML. HTML holding only `data:` images is
 * not, as the image extension does not accept them.
 */
const hasPastableHtml = (data: DataTransfer | null) => {
  const html = data?.getData("text/html");

  if (!html) {
    return false;
  }

  const document = new DOMParser().parseFromString(html, "text/html");
  const images = Array.from(document.querySelectorAll("img"));

  return (
    images.length === 0 ||
    document.body.textContent?.trim() !== "" ||
    images.some((image) => !image.getAttribute("src")?.startsWith("data:"))
  );
};

const getImageFiles = (data: DataTransfer | null) =>
  Array.from(data?.files ?? []).filter((file) =>
    file.type.startsWith("image/"),
  );
