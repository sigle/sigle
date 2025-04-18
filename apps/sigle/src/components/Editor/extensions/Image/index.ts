import TipTapImageBase, { type ImageOptions } from "@tiptap/extension-image";
import { ReactNodeViewRenderer } from "@tiptap/react";
import { ImageComponent } from "./Component";

export const TipTapImage = TipTapImageBase.extend<ImageOptions>({
  addNodeView() {
    return ReactNodeViewRenderer(ImageComponent);
  },
});
