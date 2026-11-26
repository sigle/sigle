import type {
  MediaImageMetadata,
  MetadataAttribute,
  PostMetadata,
} from "@sigle/sdk";
import type { Editor } from "@tiptap/core";
import {
  createPostMetadata,
  MediaImageMimeType,
  MetadataAttributeType,
  PostMetadataSchemaId,
} from "@sigle/sdk";
import { fileTypeFromBuffer } from "file-type";
import { env } from "@/env";
import { CONTENT_WARNINGS } from "@/lib/content-warning";
import { resolveImageUrl } from "@/lib/images";
import type { EditorPostFormData } from "./EditorFormProvider";

const generateMetadataAttributesFromForm = ({
  post,
}: {
  post: EditorPostFormData;
}): Array<MetadataAttribute> => {
  const attributes: Array<MetadataAttribute> = [];

  if (post.metaTitle) {
    attributes.push({
      type: MetadataAttributeType.STRING,
      value: post.metaTitle,
      key: "meta-title",
    });
  }

  if (post.metaDescription) {
    attributes.push({
      type: MetadataAttributeType.STRING,
      value: post.metaDescription,
      key: "meta-description",
    });
  }

  if (post.canonicalUri) {
    attributes.push({
      type: MetadataAttributeType.STRING,
      value: post.canonicalUri,
      key: "canonical-uri",
    });
  }

  return attributes;
};

const getImageMediaMetadata = async (
  url: string,
): Promise<MediaImageMetadata> => {
  const response = await fetch(resolveImageUrl(url, { gateway: true }));
  const arrayBuffer = await response.arrayBuffer();
  const buffer = Buffer.from(arrayBuffer);
  const contentType = await fileTypeFromBuffer(buffer);
  let type: MediaImageMimeType;

  switch (contentType?.mime) {
    case "image/jpeg":
      type = MediaImageMimeType.JPEG;
      break;
    case "image/png":
      type = MediaImageMimeType.PNG;
      break;
    case "image/webp":
      type = MediaImageMimeType.WEBP;
      break;
    default:
      throw new Error(`Image type "${contentType?.mime}" is not supported`);
  }

  return {
    url,
    type,
  };
};

export const generateSigleMetadataFromForm = async ({
  editor,
  postId,
  post,
}: {
  editor?: Editor;
  postId: string;
  post: EditorPostFormData;
}): Promise<PostMetadata> => {
  // The start of the post text, used as the description in the post cards.
  const excerpt = (editor?.getText() || "").slice(0, 350);

  const metadataAttributes = generateMetadataAttributesFromForm({ post });

  const coverImage = post.coverImage
    ? await getImageMediaMetadata(post.coverImage)
    : undefined;

  const description = `${excerpt}...\n\nWritten on www.sigle.io`;

  const metadata = createPostMetadata({
    $schema: PostMetadataSchemaId.LATEST,
    name: post.title,
    description,
    external_url: `${env.NEXT_PUBLIC_APP_URL}/p/${postId}`,
    content: {
      id: postId,
      title: post.title,
      content: post.content,
      excerpt,
      attributes:
        metadataAttributes.length > 0 ? metadataAttributes : undefined,
      coverImage,
      tags: (post.tags?.length || 0) > 0 ? post.tags : undefined,
      contentWarning: post.contentWarning
        ? CONTENT_WARNINGS[post.contentWarning].metadata
        : undefined,
    },
  });

  return metadata;
};
