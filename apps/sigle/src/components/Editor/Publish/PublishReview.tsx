import { Button, Callout, Dialog, Flex, Grid, Text } from "@radix-ui/themes";
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
  // biome-ignore lint/correctness/useExhaustiveDependencies: ok
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
            // @ts-expect-error for some reason the type is not recognized
            errors?.collect?.collectLimit?.type?.message ||
            errors?.collect?.collectLimit?.limit?.message,
          price: errors.collect?.collectPrice?.price?.message,
        });
      },
    )();
  }, []);

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

      {type === "draft" ? (
        <Callout.Root color="orange" role="alert">
          <Callout.Icon>
            <IconExclamationCircle />
          </Callout.Icon>
          <Callout.Text>
            Review your post before publishing. Once published, you won
            {"'"}t be able to make any edits to the collect settings anymore.
          </Callout.Text>
        </Callout.Root>
      ) : null}

      <Grid columns="2" gap="4" width="auto">
        <PublishReviewGeneral />
        <PublishReviewCollect />
      </Grid>

      <Flex gap="3" justify="end">
        <Dialog.Close>
          <Button variant="soft" color="gray">
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
      </Flex>
    </div>
  );
};
