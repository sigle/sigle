import { env } from '@/env';
import { resolveImageUrl } from '@/lib/images';
import type { Editor } from '@tiptap/core';
import type { EditorPostFormData } from './EditorFormProvider';
import {
  createPostMetadata,
  MediaImageMimeType,
  type MediaImageMetadata,
  type MetadataAttribute,
  type PostMetadata,
} from '@sigle/sdk';
import { fileTypeFromBuffer } from 'file-type';

const generateMetadataAttributesFromForm = ({
  editorText,
  post,
}: {
  editorText: string;
  post: EditorPostFormData;
}): MetadataAttribute[] => {
  const attributes: MetadataAttribute[] = [
    // Generate an excerpt from the content that can be used as the description in the publication cards
    {
      value: editorText.slice(0, 350),
      key: 'excerpt',
    },
  ];
  if (post.metaTitle) {
    attributes.push({
      value: post.metaTitle,
      key: 'meta-title',
    });
  }
  if (post.metaDescription) {
    attributes.push({
      value: post.metaDescription,
      key: 'meta-description',
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
  let type: MediaImageMimeType | null = null;
  switch (contentType?.mime) {
    case 'image/jpeg':
      type = MediaImageMimeType.JPEG;
      break;
    case 'image/png':
      type = MediaImageMimeType.PNG;
      break;
    case 'image/webp':
      type = MediaImageMimeType.WEBP;
  }
  if (!type) {
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
  const editorText = editor?.getText() || '';
  const metadataAttributes = generateMetadataAttributesFromForm({
    editorText,
    post,
  });
  const coverImage = post.coverImage
    ? await getImageMediaMetadata(post.coverImage)
    : undefined;

  let description =
    metadataAttributes.find((attribute) => attribute.key === 'excerpt')
      ?.value || '';
  description = `${description}...\n\nWritten on www.sigle.io`;

  const metadata = createPostMetadata({
    name: post.title,
    description,
    external_url: `${env.NEXT_PUBLIC_APP_URL}/p/${postId}`,
    // TODO upload image to IPFS and add it to the metadata
    // image: `${env.NEXT_PUBLIC_APP_URL}/api/post/${postId}/nft-image`,
    // TODO keep content or rename to metadata?
    content: {
      id: postId,
      title: post.title,
      content: post.content,
      attributes:
        metadataAttributes.length > 0 ? metadataAttributes : undefined,
      coverImage,
      // locale: 'en',
      // tags: [],
    },
  });

  return metadata;
};
