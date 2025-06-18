import { AspectRatio, Card, Inset, Text, Tooltip } from "@radix-ui/themes";
import { IconHelpCircle } from "@tabler/icons-react";
import { useFormContext } from "react-hook-form";
import { env } from "@/env";
import { resolveImageUrl } from "@/lib/images";
import { prettifyUrl } from "@/lib/urls";
import type { EditorPostFormData } from "../EditorFormProvider";
import { useEditorStore } from "../store";

export const SeoPreview = () => {
  const editor = useEditorStore((state) => state.editor);
  const { watch } = useFormContext<EditorPostFormData>();
  const watchTitle = watch("title");
  const watchMetaTitle = watch("metaTitle");
  const watchMetaDescription = watch("metaDescription");
  const watchCoverImage = watch("coverImage");

  const metaTitle = watchMetaTitle || watchTitle;
  const metaDescription =
    watchMetaDescription || editor?.getText().slice(0, 90);
  const metaImage = watchCoverImage;

  return (
    <div>
      <Text as="div" size="2" mb="1" className="flex items-center gap-1">
        Preview
        <Text color="gray">
          <Tooltip content="This is how the post will be displayed when sharing the link on social media">
            <IconHelpCircle size={16} />
          </Tooltip>
        </Text>
      </Text>
      <Card size="1">
        {metaImage ? (
          <Inset
            clip="padding-box"
            side="top"
            className="mb-2 border-b border-solid border-gray-6"
          >
            <AspectRatio ratio={1.91 / 1}>
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img
                src={resolveImageUrl(metaImage)}
                alt="Cover social media"
                style={{
                  objectFit: "cover",
                  width: "100%",
                  height: "100%",
                  backgroundColor: "var(--gray-5)",
                }}
              />
            </AspectRatio>
          </Inset>
        ) : null}
        <Text as="div" size="2" className="truncate">
          {metaTitle}
        </Text>
        <Text
          as="div"
          size="2"
          color="gray"
          className="truncate"
          style={{ marginTop: "2px" }}
        >
          {metaDescription}
        </Text>
        <Text as="div" size="2" color="gray" className="truncate">
          {prettifyUrl(env.NEXT_PUBLIC_APP_URL)}
        </Text>
      </Card>
    </div>
  );
};
