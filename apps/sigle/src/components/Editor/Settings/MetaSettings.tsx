import { IconArrowUpRight } from "@tabler/icons-react";
import { useFormContext } from "react-hook-form";
import {
  Field,
  FieldDescription,
  FieldGroup,
  FieldLabel,
} from "@/components/ui/field";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { cn } from "@/lib/cn";
import type { EditorPostFormData } from "../EditorFormProvider";
import { DialogTitleGoBack } from "./DialogTitleGoBack";
import { SeoPreview } from "./SeoPreview";

/** Characters used out of the recommended length, muted until it is passed. */
const CharacterCount = ({
  value,
  recommended,
}: {
  value: string | undefined;
  recommended: number;
}) => {
  const count = (value || "").length;

  return (
    <span
      className={cn("ml-auto font-mono text-xs font-normal", {
        "text-muted-foreground": count <= recommended,
        "text-destructive": count > recommended,
      })}
    >
      {count} / {recommended}
    </span>
  );
};

export const MetaSettings = () => {
  const { register, watch } = useFormContext<EditorPostFormData>();
  const watchMetaTitle = watch("metaTitle");
  const watchMetaDescription = watch("metaDescription");

  return (
    <div className="animate-in px-4 pb-6 slide-in-from-right-5 fade-in">
      <DialogTitleGoBack title="Search and social preview" />

      <FieldGroup className="mt-2 border-t border-border pt-5">
        <Field>
          <FieldLabel htmlFor="metaTitle">
            Title
            <CharacterCount value={watchMetaTitle} recommended={70} />
          </FieldLabel>
          <Input
            id="metaTitle"
            placeholder="Defaults to the post title"
            maxLength={100}
            {...register("metaTitle")}
          />
        </Field>

        <Field>
          <FieldLabel htmlFor="metaDescription">
            Description
            <CharacterCount value={watchMetaDescription} recommended={156} />
          </FieldLabel>
          <Textarea
            id="metaDescription"
            placeholder="Defaults to the start of the post"
            maxLength={250}
            rows={3}
            {...register("metaDescription")}
          />
        </Field>

        <Field>
          <FieldLabel htmlFor="canonicalUri">Canonical link</FieldLabel>
          <Input
            id="canonicalUri"
            placeholder="https://"
            maxLength={200}
            {...register("canonicalUri")}
          />
          <FieldDescription>
            If this post first appeared elsewhere, link to the original.{" "}
            <a
              href="https://developers.google.com/search/docs/crawling-indexing/consolidate-duplicate-urls"
              target="_blank"
              rel="noreferrer"
              className="inline-flex items-center gap-0.5"
            >
              Learn more
              <IconArrowUpRight size={12} />
            </a>
          </FieldDescription>
        </Field>

        <SeoPreview />
      </FieldGroup>
    </div>
  );
};
