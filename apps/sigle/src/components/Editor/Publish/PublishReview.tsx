import {
  IconAlertCircle,
  IconClock,
  IconExternalLink,
} from "@tabler/icons-react";
import { formatDistanceToNow } from "date-fns";
import { usePostHog } from "posthog-js/react";
import { useEffect, useState } from "react";
import { useFormContext } from "react-hook-form";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { Button } from "@/components/ui/button";
import { DialogClose, DialogFooter } from "@/components/ui/dialog";
import { PUBLISH_LIMITS } from "@/lib/plans";
import { sigleApiClient } from "@/lib/sigle";
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

  // Refetched each time the dialog opens. The server enforces the limit, this
  // only saves the user a wallet signature that would be rejected. Also
  // refetched on focus, so upgrading to Pro in another tab unlocks publishing.
  const { data: limits } = sigleApiClient.useQuery(
    "get",
    "/api/me/limits",
    {},
    { refetchOnWindowFocus: true },
  );

  const { data: me } = sigleApiClient.useQuery(
    "get",
    "/api/me",
    {},
    { refetchOnWindowFocus: true },
  );

  const publishLimit = limits?.publish;

  const publishLimitReached =
    publishLimit !== undefined && publishLimit.used >= publishLimit.limit;

  const posthog = usePostHog();
  const showUpgrade = publishLimitReached && me?.plan === "free";

  // Reported like the `UpgradeDialog` prompts, with their trigger.
  useEffect(() => {
    if (showUpgrade) {
      posthog.capture("upgrade_prompt_viewed", { trigger: "publish_limit" });
    }
  }, [posthog, showUpgrade]);

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

      {publishLimit !== undefined && publishLimitReached ? (
        <Alert>
          <IconClock size={16} />
          <AlertTitle>Daily publish limit reached</AlertTitle>
          <AlertDescription>
            You published {publishLimit.limit} posts in the last 24 hours. You
            can publish again{" "}
            {publishLimit.resetsAt === null
              ? "later"
              : formatDistanceToNow(publishLimit.resetsAt, {
                  addSuffix: true,
                })}
            .
            {showUpgrade ? (
              <>
                {" "}
                Pro members can publish up to {PUBLISH_LIMITS.pro} posts per
                day.
                <Button
                  size="sm"
                  // The alert underlines its links, not wanted on a button.
                  className="mt-2 flex w-fit no-underline!"
                  nativeButton={false}
                  render={
                    // A new tab keeps this draft and the dialog open.
                    <a
                      href="/dashboard/plan"
                      target="_blank"
                      rel="noreferrer"
                    />
                  }
                  onClick={() => {
                    posthog.capture("upgrade_prompt_clicked", {
                      trigger: "publish_limit",
                    });
                  }}
                >
                  Upgrade to Pro
                  <IconExternalLink size={14} />
                </Button>
              </>
            ) : null}
          </AlertDescription>
        </Alert>
      ) : null}

      <PublishReviewGeneral />

      <p className="text-xs/relaxed text-pretty text-muted-foreground">
        {type === "draft"
          ? "Published stories are permanent on Arweave. You can update or hide this one later, but this version stays in the archive."
          : "The previous version stays in the Arweave archive."}
      </p>

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
            publishLimitReached ||
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
