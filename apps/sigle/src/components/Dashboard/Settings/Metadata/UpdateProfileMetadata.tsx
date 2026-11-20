import { zodResolver } from "@hookform/resolvers/zod";
import { createId } from "@paralleldrive/cuid2";
import {
  createProfileMetadata,
  type paths,
  ProfileMetadataSchemaId,
} from "@sigle/sdk";
import { request } from "@stacks/connect";
import { IconAt, IconBrandX } from "@tabler/icons-react";
import { useQueryClient } from "@tanstack/react-query";
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

type UserResponse =
  paths["/api/users/{address}"]["get"]["responses"][200]["content"]["application/json"];

interface UpdateProfileMetadataProps {
  profile: UserResponse["profile"];
  setEditingProfileMetadata: (editing: boolean) => void;
}

export const UpdateProfileMetadata = ({
  profile,
  setEditingProfileMetadata,
}: UpdateProfileMetadataProps) => {
  const queryClient = useQueryClient();

  const {
    start: startToast,
    completeStep,
    setStepError,
  } = useMultiStepToast({
    steps: [
      { id: "signature", title: "Signing with Stacks wallet" },
      { id: "upload", title: "Uploading data to Arweave" },
    ],
    successMessage: "Profile updated!",
  });

  const uploadProfileMetadata = sigleApiClient.useMutation(
    "put",
    "/api/me/profile",
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
      picture: profile?.picture?.url || undefined,
      coverPicture: profile?.coverPicture?.url || undefined,
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
        body: { metadata },
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

    // server-v2 stores the profile on upload and returns it, so the cached
    // user is updated without fetching it again.
    completeStep("upload");
    const { address, profile: storedProfile } = data.value;
    queryClient.setQueriesData<UserResponse>(
      { queryKey: ["get", "/api/users/{address}"] },
      (cached) =>
        cached?.address === address
          ? { address, profile: storedProfile }
          : cached,
    );
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
