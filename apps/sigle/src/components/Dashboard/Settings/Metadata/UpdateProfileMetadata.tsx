import { zodResolver } from "@hookform/resolvers/zod";
import { createId } from "@paralleldrive/cuid2";
import {
  createProfileMetadata,
  type paths,
  ProfileMetadataSchemaId,
} from "@sigle/sdk";
import { request } from "@stacks/connect";
import { IconAt } from "@tabler/icons-react";
import { useQueryClient } from "@tanstack/react-query";
import { Result } from "better-result";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { useMultiStepToast } from "@/components/Shared/MultiStepToast";
import { Button } from "@/components/ui/button";
import { FieldError } from "@/components/ui/field";
import { Input } from "@/components/ui/input";
import {
  InputGroup,
  InputGroupAddon,
  InputGroupInput,
} from "@/components/ui/input-group";
import { Textarea } from "@/components/ui/textarea";
import { sigleApiClient } from "@/lib/sigle";
import { SettingsRow } from "../SettingsRow";
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
    watch,
    formState: { errors, isDirty, isSubmitting },
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
    const userQueries = { queryKey: ["get", "/api/users/{address}"] };
    // A refetch started before the upload, such as on window focus after the
    // wallet prompt, would otherwise overwrite the cache with the old profile.
    await queryClient.cancelQueries(userQueries);
    queryClient.setQueriesData<UserResponse>(userQueries, (cached) =>
      cached?.address === address
        ? { ...cached, profile: storedProfile }
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

    setValue("twitter", value, { shouldValidate: true, shouldDirty: true });
  };

  return (
    <form onSubmit={onSubmit}>
      <SettingsRow label="Picture" description="A square JPG or PNG.">
        <UploadProfilePicture
          picture={watch("picture")}
          setPicture={(value) =>
            setValue("picture", value, {
              shouldValidate: true,
              shouldDirty: true,
            })
          }
        />
      </SettingsRow>

      <SettingsRow
        label="Cover"
        description="A wide JPG or PNG for the top of your blog."
      >
        <UploadProfileCoverPicture
          picture={watch("coverPicture")}
          setPicture={(value) =>
            setValue("coverPicture", value, {
              shouldValidate: true,
              shouldDirty: true,
            })
          }
        />
      </SettingsRow>

      <SettingsRow label="Name" htmlFor="displayName">
        <Input
          id="displayName"
          aria-invalid={!!errors.displayName}
          placeholder="Your name"
          {...register("displayName")}
        />
        {errors.displayName ? (
          <FieldError>{errors.displayName.message}</FieldError>
        ) : null}
      </SettingsRow>

      <SettingsRow
        label="Bio"
        htmlFor="description"
        description="Markdown for bold, italic and links."
      >
        <Textarea
          id="description"
          aria-invalid={!!errors.description}
          placeholder="Describe yourself in a few words"
          rows={4}
          {...register("description")}
        />
        {errors.description ? (
          <FieldError>{errors.description.message}</FieldError>
        ) : null}
      </SettingsRow>

      <SettingsRow label="Website" htmlFor="website">
        <Input
          id="website"
          aria-invalid={!!errors.website}
          placeholder="https://my-website.com"
          {...register("website")}
        />
        {errors.website ? (
          <FieldError>{errors.website.message}</FieldError>
        ) : null}
      </SettingsRow>

      <SettingsRow label="X (Twitter)" htmlFor="twitter">
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
      </SettingsRow>

      <div className="flex items-center justify-end gap-2 pt-6">
        <Button
          variant="ghost"
          type="button"
          disabled={isSubmitting}
          onClick={() => setEditingProfileMetadata(false)}
        >
          Cancel
        </Button>
        <Button
          type="submit"
          disabled={!isDirty || isSubmitting}
          loading={isSubmitting}
        >
          Save changes
        </Button>
      </div>
    </form>
  );
};
