import { Flex, Link, Text, TextArea, TextField } from "@radix-ui/themes";
import { IconHelpCircle } from "@tabler/icons-react";
import { useFormContext } from "react-hook-form";
import type { EditorPostFormData } from "../EditorFormProvider";
import { DialogTitleGoBack } from "./DialogTitle";
import { SeoPreview } from "./SeoPreview";

export const MetaSettings = () => {
  const { register, watch } = useFormContext<EditorPostFormData>();
  const watchMetaTitle = watch("metaTitle");
  const watchMetaDescription = watch("metaDescription");

  return (
    <div className="animate-in slide-in-from-right-5 fade-in">
      <DialogTitleGoBack
        title="Meta SEO"
        description="Edit your post SEO settings"
      />

      <Flex direction="column" gap="3">
        <div>
          <Text as="p" size="2" mb="1">
            Meta title
          </Text>
          <TextField.Root
            placeholder="Meta title"
            maxLength={100}
            {...register("metaTitle")}
          />
          <Text as="p" mt="2" size="1" color="gray">
            Recommended:{" "}
            <Text color="gray" highContrast>
              70
            </Text>{" "}
            characters.
          </Text>
          <Text as="p" size="1" color="gray">
            You have used {(watchMetaTitle || "").length} characters.
          </Text>
        </div>
        <div>
          <Text as="p" size="2" mb="1">
            Meta description
          </Text>
          <TextArea
            placeholder="Meta description"
            maxLength={250}
            rows={4}
            {...register("metaDescription")}
          />
          <Text as="p" mt="2" size="1" color="gray">
            Recommended:{" "}
            <Text color="gray" highContrast>
              156
            </Text>{" "}
            characters.
          </Text>
          <Text as="p" size="1" color="gray">
            You have used {(watchMetaDescription || "").length} characters.
          </Text>
        </div>
        <div>
          <Text as="div" size="2" mb="1" className="flex items-center gap-1">
            Canonical URI
            <Text color="gray">
              <Link
                href="https://developers.google.com/search/docs/crawling-indexing/consolidate-duplicate-urls"
                target="_blank"
                rel="noreferrer"
              >
                <IconHelpCircle size={16} />
              </Link>
            </Text>
          </Text>
          <TextField.Root
            placeholder="https://"
            maxLength={200}
            {...register("canonicalUri")}
          />
        </div>
        <SeoPreview />
      </Flex>
    </div>
  );
};
