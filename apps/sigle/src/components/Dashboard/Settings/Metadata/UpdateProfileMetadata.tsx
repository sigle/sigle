import { zodResolver } from "@hookform/resolvers/zod";
import { createId } from "@paralleldrive/cuid2";
import {
  type paths,
  createProfileMetadata,
  ProfileMetadataSchemaId,
} from "@sigle/sdk";
import { request } from "@stacks/connect";
import { IconAt, IconBrandX } from "@tabler/icons-react";
import { Result } from "better-result";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { useMultiStepToast } from "@/components/Shared/MultiStepToast";
import { Button } from "@/components/ui/button";
import {
  Field,
  FieldDescription,
  FieldError,
  FieldGroup,
  FieldLabel,
} from "@/components/ui/field";
import { Input } from "@/components/ui/input";
import {
  InputGroup,
  InputGroupAddon,
  InputGroupInput,
} from "@/components/ui/input-group";
import { Textarea } from "@/components/ui/textarea";
import { useSession } from "@/lib/auth-hooks";
import { sigleApiClient } from "@/lib/sigle";
import { UploadProfileCoverPicture } from "./UploadProfileCoverPicture";
import { UploadProfilePicture } from "./UploadProfilePicture";

const updateProfileMetadataSchema = z.object({
  displayName: z.string().optional(),
  description: z.string().optional(),
  website: z.url().optional().or(z.literal("")),
  twitter: z.string().optional(),
  picture: z.string().optional(),
  coverPicture: z.string().optional(),
});

interface UpdateProfileMetadataProps {
  profile: paths["/api/users/{username}"]["get"]["responses"]["200"]["content"]["application/json"]["profile"];
  setEditingProfileMetadata: (editing: boolean) => void;
}

export const UpdateProfileMetadata = ({
  profile,
  setEditingProfileMetadata,
}: UpdateProfileMetadataProps) => {
  const { data: session } = useSession();

  const {
    start: startToast,
    completeStep,
    setStepError,
  } = useMultiStepToast({
    steps: [
      { id: "signature", title: "Signing with Stacks wallet" },
      { id: "upload", title: "Uploading data to Arweave" },
      { id: "index", title: "Indexing profile" },
    ],
    successMessage: "Profile updated!",
  });

  const uploadProfileMetadata = sigleApiClient.useMutation(
    "post",
    "/api/protected/user/profile/upload-metadata",
  );

  const triggerIndexing = sigleApiClient.useMutation(
    "post",
    "/api/protected/user/profile/trigger-indexing",
  );

  const userId = session?.user.id;

  const refetchProfile = sigleApiClient.useQuery(
    "get",
    "/api/users/{username}",
    {
      params: {
        path: {
          username: userId || "",
        },
      },
    },
    {
      enabled: false,
    },
  );

  const {
    register,
    handleSubmit,
    setValue,
    getValues,
    formState: { errors, isSubmitting },
  } = useForm({
    resolver: zodResolver(updateProfileMetadataSchema),
    values: {
      displayName: profile?.displayName || undefined,
      description: profile?.description || undefined,
      picture: profile?.pictureUri?.id || undefined,
      coverPicture: profile?.coverPictureUri?.id || undefined,
      website: profile?.website || undefined,
      twitter: profile?.twitter || undefined,
    },
  });

  const onSubmit = handleSubmit(async (formValues) => {
    startToast();

    const metadata = createProfileMetadata({
      $schema: ProfileMetadataSchemaId.LATEST,
      content: {
        id: createId(),
        displayName: formValues.displayName || undefined,
        description: formValues.description || undefined,
        twitter: formValues.twitter || undefined,
        website: formValues.website || undefined,
        picture: formValues.picture || undefined,
        coverPicture: formValues.coverPicture || undefined,
      },
    });

    let signature = "";

    try {
      const { signature: _, ...metadataToSign } = metadata;
      const message = JSON.stringify(metadataToSign);

      const response = await request("stx_signMessage", {
        message,
      });

      signature = response.signature;
    } catch (error) {
      console.error(error);
      setStepError(
        "signature",
        "Wallet signature request was cancelled or failed.",
      );

      return;
    }

    // Add the signature to the metadata
    metadata.signature = signature;
    completeStep("signature");

    const data = await uploadProfileMetadata
      .mutateAsync({
        body: {},
        bodySerializer: () => JSON.stringify({ metadata }),
      })
      .then((result) => Result.ok(result))
      .catch((error) => Result.err(error));

    if (data.isErr()) {
      setStepError(
        "upload",
        data.error.message ? data.error.message : data.error,
      );

      return;
    }

    completeStep("upload");

    try {
      await triggerIndexing.mutateAsync({});
    } catch (error) {
      setStepError(
        "index",
        error instanceof Error ? error.message : "Failed to trigger indexing",
      );

      return;
    }

    const arweaveId = data.value.id;
    const pollingInterval = 2_000;
    const timeout = 180_000;
    const startTime = Date.now();

    let isIndexed = false;

    while (Date.now() - startTime < timeout) {
      const result = await refetchProfile.refetch();

      // Successfully indexed
      if (result.data?.profile?.txId === arweaveId) {
        isIndexed = true;
        break;
      }

      await new Promise((resolve) => {
        setTimeout(resolve, pollingInterval);
      });
    }

    if (!isIndexed) {
      setStepError(
        "index",
        "Profile update timed out. Please refresh the page.",
      );

      return;
    }

    completeStep("index");
    setEditingProfileMetadata(false);
  });

  const handleXChange: React.ChangeEventHandler<HTMLInputElement> = (event) => {
    let value = event.target.value;

    // If user pastes a full url, extract the username
    if (value.startsWith("http")) {
      value = value.split("/").pop() || "";
    }

    setValue("twitter", value, { shouldValidate: true });
  };

  return (
    <form onSubmit={onSubmit} className="space-y-4">
      <FieldGroup>
        <Field>
          <FieldLabel htmlFor="displayName">Name</FieldLabel>
          <Input
            id="displayName"
            aria-invalid={!!errors.displayName}
            placeholder="Your name"
            {...register("displayName")}
          />
          {errors.displayName ? (
            <FieldError>{errors.displayName.message}</FieldError>
          ) : null}
        </Field>

        <Field>
          <FieldLabel htmlFor="description">Description</FieldLabel>
          <FieldDescription>
            Markdown supported (limited to bold, italic, links)
          </FieldDescription>
          <Textarea
            id="description"
            aria-invalid={!!errors.description}
            placeholder="Describe yourself in a few words (supports markdown)"
            rows={4}
            {...register("description")}
          />
          {errors.description ? (
            <FieldError>{errors.description.message}</FieldError>
          ) : null}
        </Field>

        <Field>
          <FieldLabel htmlFor="website">Website</FieldLabel>
          <Input
            id="website"
            aria-invalid={!!errors.website}
            placeholder="https://my-website.com"
            {...register("website")}
          />
          {errors.website ? (
            <FieldError>{errors.website.message}</FieldError>
          ) : null}
        </Field>

        <Field>
          <FieldLabel htmlFor="twitter">
            <IconBrandX height="16" width="16" /> (Twitter)
          </FieldLabel>
          <InputGroup>
            <InputGroupInput
              id="twitter"
              aria-invalid={!!errors.twitter}
              placeholder="username"
              {...register("twitter")}
              onChange={handleXChange}
            />
            <InputGroupAddon align="inline-start">
              <IconAt size={16} className="text-muted-foreground" />
            </InputGroupAddon>
          </InputGroup>
          {errors.twitter ? (
            <FieldError>{errors.twitter.message}</FieldError>
          ) : null}
        </Field>

        <UploadProfilePicture
          picture={getValues("picture")}
          setPicture={(value) =>
            setValue("picture", value, { shouldValidate: true })
          }
        />

        <UploadProfileCoverPicture
          picture={getValues("coverPicture")}
          setPicture={(value) =>
            setValue("coverPicture", value, { shouldValidate: true })
          }
        />

        <Field orientation="horizontal" className="justify-end">
          <Button
            variant="outline"
            type="button"
            disabled={isSubmitting}
            onClick={() => setEditingProfileMetadata(false)}
          >
            Cancel
          </Button>
          <Button type="submit" loading={isSubmitting}>
            Save
          </Button>
        </Field>
      </FieldGroup>
    </form>
  );
};
