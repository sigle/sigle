import { Button, Callout, Dialog, Text } from "@radix-ui/themes";
import { IconExclamationCircle } from "@tabler/icons-react";
import { useEffect, useState } from "react";
import { useFormContext } from "react-hook-form";
import type { EditorPostFormData } from "../EditorFormProvider";
import { PublishReviewCollect } from "./ReviewCollect";
import { PublishReviewGeneral } from "./ReviewGeneral";

interface PublishReviewProps {
  onPublish: () => void;
}

export const PublishReview = ({ onPublish }: PublishReviewProps) => {
  const [isFormValid, setIsFormValid] = useState<
    | {
        valid: false;
        title?: string;
        content?: string;
        metaTitle?: string;
        metaDescription?: string;
        coverImage?: string;
        collectLimit?: string;
        price?: string;
      }
    | "loading"
    | { valid: true }
  >("loading");
  const { handleSubmit, formState, watch } =
    useFormContext<EditorPostFormData>();
  const type = watch("type");

  // Validate form on mount so we can show the various error messages in the callout
  // and disable the publish button
  // oxlint-disable-next-line exhaustive-deps
  useEffect(() => {
    handleSubmit(
      async () => {
        setIsFormValid({ valid: true });
      },
      (errors) => {
        console.log("errors", errors);
        setIsFormValid({
          valid: false,
          title: errors.title?.message,
          content: errors.content?.message,
          metaTitle: errors.metaTitle?.message,
          metaDescription: errors.metaDescription?.message,
          coverImage: errors.coverImage?.message,
          collectLimit:
            errors.collect?.collectLimit?.message ||
            errors?.collect?.collectLimit?.type?.message ||
            errors?.collect?.collectLimit?.limit?.message,
          price: errors.collect?.collectPrice?.price?.message,
        });
      },
    )();
    // oxlint-disable-next-line exhaustive-deps
  }, []);

  const isCollectEnabled = false;

  return (
    <div className="space-y-4">
      {isFormValid !== "loading" && !isFormValid.valid ? (
        <Callout.Root color="red" role="alert">
          <Callout.Icon>
            <IconExclamationCircle />
          </Callout.Icon>
          <Callout.Text>Please fix all errors before publishing. </Callout.Text>
          <Text as="div" size="2">
            <ul className="list-inside list-disc">
              {isFormValid.title ? <li>Title: {isFormValid.title}</li> : null}
              {isFormValid.content ? (
                <li>Content: {isFormValid.content}</li>
              ) : null}
              {isFormValid.metaTitle ? (
                <li>Meta title: {isFormValid.metaTitle}</li>
              ) : null}
              {isFormValid.metaDescription ? (
                <li>Meta description: {isFormValid.metaDescription}</li>
              ) : null}
              {isFormValid.coverImage ? (
                <li>Cover image: {isFormValid.coverImage}</li>
              ) : null}
              {isFormValid.collectLimit ? (
                <li>Collect limit: {isFormValid.collectLimit}</li>
              ) : null}
              {isFormValid.price ? <li>Price: {isFormValid.price}</li> : null}
            </ul>
          </Text>
        </Callout.Root>
      ) : null}

      {type === "draft" && isCollectEnabled ? (
        <Callout.Root color="orange" role="alert">
          <Callout.Icon>
            <IconExclamationCircle />
          </Callout.Icon>
          <Callout.Text>
            Review your post before publishing. Once published, you won&apos;t
            be able to make any edits to the collect settings anymore.
          </Callout.Text>
        </Callout.Root>
      ) : null}

      <div
        className={`grid gap-4 ${isCollectEnabled ? "grid-cols-2" : "grid-cols-1"}`}
      >
        <PublishReviewGeneral />
        <PublishReviewCollect />
      </div>

      <div className="flex justify-end gap-3">
        <Dialog.Close>
          <Button variant="soft" color="gray" disabled={formState.isSubmitting}>
            Cancel
          </Button>
        </Dialog.Close>
        <Button
          disabled={isFormValid === "loading" || !isFormValid.valid}
          loading={formState.isSubmitting}
          onClick={onPublish}
        >
          {type === "draft" ? "Publish" : "Update"}
        </Button>
      </div>
    </div>
  );
};
