import { IconHelpCircle } from "@tabler/icons-react";
import { useFormContext } from "react-hook-form";
import {
  Field,
  FieldDescription,
  FieldGroup,
  FieldLabel,
} from "@/components/ui/field";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
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

      <FieldGroup>
        <Field>
          <FieldLabel htmlFor="metaTitle">Meta title</FieldLabel>
          <Input
            placeholder="Meta title"
            maxLength={100}
            {...register("metaTitle")}
          />
          <FieldDescription className="text-xs">
            Recommended: <span className="font-medium">70</span> characters. You
            have used{" "}
            <span className="font-medium">{(watchMetaTitle || "").length}</span>{" "}
            characters.
          </FieldDescription>
        </Field>

        <Field>
          <FieldLabel htmlFor="metaDescription">Meta description</FieldLabel>
          <Textarea
            placeholder="Meta description"
            maxLength={250}
            rows={4}
            {...register("metaDescription")}
          />
          <FieldDescription className="text-xs">
            Recommended: <span className="font-medium">156</span> characters.
            You have used{" "}
            <span className="font-medium">
              {(watchMetaDescription || "").length}
            </span>{" "}
            characters.
          </FieldDescription>
        </Field>

        <Field>
          <FieldLabel htmlFor="canonicalUri">
            Canonical URI{" "}
            <a
              href="https://developers.google.com/search/docs/crawling-indexing/consolidate-duplicate-urls"
              target="_blank"
              rel="noreferrer"
            >
              <IconHelpCircle size={16} />
            </a>
          </FieldLabel>
          <Input
            placeholder="https://"
            maxLength={200}
            {...register("canonicalUri")}
          />
        </Field>

        <SeoPreview />
      </FieldGroup>
    </div>
  );
};
