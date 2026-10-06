import { IconAlertCircle } from "@tabler/icons-react";
import { useEffect, useState } from "react";
import { useFormContext } from "react-hook-form";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { Button } from "@/components/ui/button";
import { DialogClose, DialogFooter } from "@/components/ui/dialog";
import type { EditorPostFormData } from "../EditorFormProvider";
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
        });
      },
    )();
    // oxlint-disable-next-line exhaustive-deps
  }, []);

  return (
    <div className="space-y-4">
      {isFormValid !== "loading" && !isFormValid.valid ? (
        <Alert variant="destructive">
          <IconAlertCircle size={16} />
          <AlertTitle>Please fix all errors before publishing</AlertTitle>
          <AlertDescription>
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
            </ul>
          </AlertDescription>
        </Alert>
      ) : null}

      <div className="grid gap-4">
        <PublishReviewGeneral />
      </div>

      <DialogFooter>
        <DialogClose
          render={
            <Button
              type="button"
              variant="outline"
              disabled={formState.isSubmitting}
            >
              Cancel
            </Button>
          }
        />

        <Button
          disabled={
            isFormValid === "loading" ||
            !isFormValid.valid ||
            formState.isSubmitting
          }
          loading={formState.isSubmitting}
          onClick={onPublish}
        >
          {type === "draft" ? "Publish" : "Update"}
        </Button>
      </DialogFooter>
    </div>
  );
};
