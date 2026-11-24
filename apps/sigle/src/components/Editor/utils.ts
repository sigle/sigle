import type { Editor } from "@tiptap/core";
import {
  createPostMetadata,
  type MediaImageMetadata,
  MediaImageMimeType,
  type PostMetadata,
  PostMetadataSchemaId,
} from "@sigle/sdk";
import { fileTypeFromBuffer } from "file-type";
import { resolveImageUrl } from "@/lib/images";
import type { EditorPostFormData } from "./EditorFormProvider";

const getImageMediaMetadata = async (
  url: string,
): Promise<MediaImageMetadata> => {
  const response = await fetch(resolveImageUrl(url, { gateway: true }));
  const arrayBuffer = await response.arrayBuffer();
  const buffer = Buffer.from(arrayBuffer);
  const contentType = await fileTypeFromBuffer(buffer);
  let type: MediaImageMimeType | null = null;

  switch (contentType?.mime) {
    case "image/gif":
      type = MediaImageMimeType.GIF;
      break;
    case "image/jpeg":
      type = MediaImageMimeType.JPEG;
      break;
    case "image/png":
      type = MediaImageMimeType.PNG;
      break;
    case "image/webp":
      type = MediaImageMimeType.WEBP;
  }

  if (!type) {
    throw new Error(`Image type "${contentType?.mime}" is not supported`);
  }

  // The size lets readers lay the cover out before it loads.
  const bitmap = await createImageBitmap(new Blob([arrayBuffer], { type }));
  const { width, height } = bitmap;
  bitmap.close();

  return { url, type, width, height };
};

/** Characters of the post text kept as its excerpt. */
const EXCERPT_LENGTH = 350;

export const generateSigleMetadataFromForm = async ({
  editor,
  postId,
  post,
}: {
  editor?: Editor;
  postId: string;
  post: EditorPostFormData;
}): Promise<PostMetadata> => {
  const coverImage = post.coverImage
    ? await getImageMediaMetadata(post.coverImage)
    : undefined;

  return createPostMetadata({
    $schema: PostMetadataSchemaId.LATEST,
    content: {
      id: postId,
      title: post.title,
      content: post.content,
      excerpt: (editor?.getText() ?? "").slice(0, EXCERPT_LENGTH).trim(),
      publishedAt: new Date().toISOString(),
      coverImage,
      tags: (post.tags?.length ?? 0) > 0 ? post.tags : undefined,
      metaTitle: post.metaTitle || undefined,
      metaDescription: post.metaDescription || undefined,
      canonicalUri: post.canonicalUri || undefined,
    },
  });
};
