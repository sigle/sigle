import type { paths } from "@sigle/sdk";
import { zodResolver } from "@hookform/resolvers/zod";
import { IconAt } from "@tabler/icons-react";
import { useQueryClient } from "@tanstack/react-query";
import { useForm } from "react-hook-form";
import { toast } from "sonner";
import { z } from "zod";
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

  const updateProfile = sigleApiClient.useMutation("put", "/api/me/profile");

  const importBnsProfile = sigleApiClient.useMutation(
    "get",
    "/api/me/profile/bns",
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
    const result = await updateProfile
      .mutateAsync({
        body: {
          displayName: formValues.displayName || null,
          description: formValues.description || null,
          twitter: formValues.twitter || null,
          website: formValues.website || null,
          picture: formValues.picture || null,
          coverPicture: formValues.coverPicture || null,
        },
      })
      .catch((error: { message?: string }) => {
        toast.error(error.message ?? "Failed to update your profile.");

        return undefined;
      });

    if (result === undefined) {
      return;
    }

    toast.success("Profile updated!");

    // The API returns the stored profile, so the cached user is updated
    // without fetching it again.
    const { address, profile: storedProfile } = result;
    const userQueries = { queryKey: ["get", "/api/users/{address}"] };
    // A refetch started before the update, such as on window focus, would
    // otherwise overwrite the cache with the old profile.
    await queryClient.cancelQueries(userQueries);
    queryClient.setQueriesData<UserResponse>(userQueries, (cached) =>
      cached?.address === address
        ? { address, profile: storedProfile }
        : cached,
    );
    setEditingProfileMetadata(false);
  });

  // Fills in the form with the profile of the user's BNS name, the user
  // reviews it and saves. Only the fields the zonefile sets are replaced.
  const onImportBns = () => {
    importBnsProfile.mutate(
      {},
      {
        onSuccess: ({ name, profile: bnsProfile }) => {
          if (name === null) {
            toast.error("Your address has no primary BNS name.");

            return;
          }

          if (bnsProfile === null) {
            toast.error(`${name} has no profile to import.`);

            return;
          }

          for (const [field, value] of Object.entries(bnsProfile)) {
            if (value !== null) {
              // SAFETY: the BNS profile fields are a subset of the form's.
              setValue(field as keyof typeof bnsProfile, value, {
                shouldValidate: true,
                shouldDirty: true,
              });
            }
          }

          toast.success(`Imported the profile of ${name}, review and save it.`);
        },
        onError: (error) => {
          toast.error(error?.message ?? "Failed to read your BNS name.");
        },
      },
    );
  };

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
          variant="outline"
          type="button"
          className="mr-auto"
          disabled={isSubmitting}
          loading={importBnsProfile.isPending}
          onClick={onImportBns}
        >
          Import from BNS
        </Button>
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
