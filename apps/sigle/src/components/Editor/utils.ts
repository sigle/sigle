import {
  createPostMetadata,
  type MediaImageMetadata,
  MediaImageMimeType,
  type MetadataAttribute,
  type PostMetadata,
} from "@sigle/sdk";
import type { Editor } from "@tiptap/core";
import { fileTypeFromBuffer } from "file-type";
import { env } from "@/env";
import { resolveImageUrl } from "@/lib/images";
import { sigleApiFetchClient } from "@/lib/sigle";
import type { CreatePostNftParams } from "../../app/api/post/nft-image/route";
import type { EditorPostFormData } from "./EditorFormProvider";

const generateMetadataAttributesFromForm = ({
  editorText,
  post,
}: {
  editorText: string;
  post: EditorPostFormData;
}): MetadataAttribute[] => {
  const attributes: MetadataAttribute[] = [
    // Generate an excerpt from the content that can be used as the description in the post cards
    {
      value: editorText.slice(0, 350),
      key: "excerpt",
    },
  ];
  if (post.metaTitle) {
    attributes.push({
      value: post.metaTitle,
      key: "meta-title",
    });
  }
  if (post.metaDescription) {
    attributes.push({
      value: post.metaDescription,
      key: "meta-description",
    });
  }
  if (post.canonicalUri) {
    attributes.push({
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
  let type: MediaImageMimeType | null = null;
  switch (contentType?.mime) {
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
  return {
    url,
    type,
  };
};

const uploadNftImage = async (
  {
    postId,
    type,
  }: {
    postId: string;
    type: "published" | "draft";
  },
  params: CreatePostNftParams,
) => {
  const url = new URL(`${env.NEXT_PUBLIC_APP_URL}/api/post/nft-image`);
  for (const [key, value] of Object.entries(params)) {
    url.searchParams.append(key, String(value));
  }
  const response = await fetch(url.toString());

  if (!response.ok) {
    throw new Error("Failed to generate NFT image");
  }

  const formData = new FormData();
  formData.append("file", await response.blob());
  formData.append("type", type);

  const data = await sigleApiFetchClient.POST(
    "/api/protected/drafts/{draftId}/upload-nft-image",
    {
      params: {
        path: {
          draftId: postId,
        },
      },
      // biome-ignore lint/suspicious/noExplicitAny: ok
      body: formData as any,
    },
  );
  if (!data.data) {
    throw new Error("Failed to upload NFT image");
  }
  return data.data.url;
};

export const generateSigleMetadataFromForm = async ({
  userAddress,
  type,
  editor,
  postId,
  post,
}: {
  userAddress: string;
  type: "published" | "draft";
  editor?: Editor;
  postId: string;
  post: EditorPostFormData;
}): Promise<PostMetadata> => {
  const editorText = editor?.getText() || "";
  const metadataAttributes = generateMetadataAttributesFromForm({
    editorText,
    post,
  });
  const coverImage = post.coverImage
    ? await getImageMediaMetadata(post.coverImage)
    : undefined;

  let description =
    metadataAttributes.find((attribute) => attribute.key === "excerpt")
      ?.value || "";
  description = `${description}...\n\nWritten on www.sigle.io`;

  const metadata = createPostMetadata({
    name: post.title,
    description,
    external_url: `${env.NEXT_PUBLIC_APP_URL}/p/${postId}`,
    image: await uploadNftImage(
      { postId, type },
      {
        title: post.title,
        coverImage: coverImage?.url,
        username: userAddress,
      },
    ),
    // TODO keep content or rename to metadata?
    content: {
      id: postId,
      title: post.title,
      content: post.content,
      attributes:
        metadataAttributes.length > 0 ? metadataAttributes : undefined,
      coverImage,
      tags: (post.tags?.length || 0) > 0 ? post.tags : undefined,
    },
  });

  return metadata;
};
