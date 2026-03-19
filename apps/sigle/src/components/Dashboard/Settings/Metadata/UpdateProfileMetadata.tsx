import { zodResolver } from "@hookform/resolvers/zod";
import { createId } from "@paralleldrive/cuid2";
import {
  type paths,
  createProfileMetadata,
  ProfileMetadataSchemaId,
} from "@sigle/sdk";
import { IconAt, IconBrandX } from "@tabler/icons-react";
import { useState } from "react";
import { useForm } from "react-hook-form";
import { toast } from "sonner";
import { z } from "zod";
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
import { Spinner } from "@/components/ui/spinner";
import { Textarea } from "@/components/ui/textarea";
import { useContractCall } from "@/hooks/useContractCall";
import { useSession } from "@/lib/auth-hooks";
import { sigleApiClient, sigleClient } from "@/lib/sigle";
import {
  getExplorerTransactionUrl,
  getPromiseTransactionConfirmation,
} from "@/lib/stacks";
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

const POLL_TIMEOUT = 60_000;
const POLL_INTERVAL = 2000;

export const UpdateProfileMetadata = ({
  profile,
  setEditingProfileMetadata,
}: UpdateProfileMetadataProps) => {
  const { data: session } = useSession();
  const [isIndexing, setIsIndexing] = useState(false);

  const { mutateAsync: uploadProfileMetadata } = sigleApiClient.useMutation(
    "post",
    "/api/protected/user/profile/upload-metadata",
    {
      onError: (error) => {
        toast.error("Failed to update profile", {
          description: error.message,
        });
      },
    },
  );

  const { mutateAsync: triggerIndexing } = sigleApiClient.useMutation(
    "post",
    "/api/protected/user/profile/trigger-indexing",
  );

  const userId = session?.user.id;

  const { refetch: refetchProfile } = sigleApiClient.useQuery(
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

  const { contractCall } = useContractCall({
    onSuccess: async (data) => {
      const toastId = toast.loading("Waiting for blockchain confirmation...");

      try {
        await getPromiseTransactionConfirmation(data.txId);
      } catch {
        toast.error("Transaction failed", {
          id: toastId,
          action: {
            label: "View tx",
            onClick: () =>
              window.open(getExplorerTransactionUrl(data.txId), "_blank"),
          },
        });
        return;
      }

      toast.loading("Indexing your profile...", { id: toastId });

      try {
        await triggerIndexing({});
      } catch (error) {
        toast.error("Failed to trigger indexing", {
          id: toastId,
          description: error instanceof Error ? error.message : undefined,
        });
        setEditingProfileMetadata(false);
        return;
      }

      setIsIndexing(true);
      const startTime = Date.now();

      const pollAndCheck = async (): Promise<void> => {
        if (Date.now() - startTime > POLL_TIMEOUT) {
          setIsIndexing(false);
          toast.error("Profile update timed out", {
            id: toastId,
            description: "Please refresh the page and try again.",
          });
          setEditingProfileMetadata(false);
          return;
        }

        const result = await refetchProfile();

        if (result.data) {
          setIsIndexing(false);
          toast.success("Profile updated!", { id: toastId });
          setEditingProfileMetadata(false);
          return;
        }

        setTimeout(pollAndCheck, POLL_INTERVAL);
      };

      pollAndCheck();
    },
    onError: (error) => {
      toast.error("Failed to update profile", {
        description: error,
      });
    },
  });

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

    const data = await uploadProfileMetadata({
      body: {
        metadata: metadata as unknown as Record<string, never>,
      },
    });

    const { parameters } = sigleClient.setProfile({
      metadata: `ar://${data.id}`,
    });

    await contractCall(parameters);
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
          <Button type="submit" disabled={isSubmitting || isIndexing}>
            {isSubmitting || isIndexing ? (
              <Spinner data-icon="inline-start" />
            ) : null}
            Save
          </Button>
        </Field>
      </FieldGroup>
    </form>
  );
};
