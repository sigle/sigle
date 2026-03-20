import { zodResolver } from "@hookform/resolvers/zod";
import { createId } from "@paralleldrive/cuid2";
import {
  type paths,
  createProfileMetadata,
  ProfileMetadataSchemaId,
} from "@sigle/sdk";
import { IconAt, IconBrandX } from "@tabler/icons-react";
import { useForm } from "react-hook-form";
import { toast } from "sonner";
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
import { Spinner } from "@/components/ui/spinner";
import { Textarea } from "@/components/ui/textarea";
import { useContractCall } from "@/hooks/useContractCall";
import { useSession } from "@/lib/auth-hooks";
import { sigleApiClient, sigleClient } from "@/lib/sigle";
import { waitForTransaction } from "@/lib/stacks";
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
    dismiss: dismissToast,
  } = useMultiStepToast({
    steps: [
      { id: "upload", title: "Uploading data to Arweave..." },
      { id: "transaction", title: "Waiting for blockchain confirmation..." },
      { id: "index", title: "Indexing your profile..." },
    ],
  });

  const uploadProfileMetadata = sigleApiClient.useMutation(
    "post",
    "/api/protected/user/profile/upload-metadata",
    {
      onError: (error) => {
        setStepError("upload", error.message);
      },
    },
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

  const { contractCall } = useContractCall();

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

    const data = await uploadProfileMetadata.mutateAsync({
      body: {
        metadata: metadata as unknown as Record<string, never>,
      },
    });
    completeStep("upload");

    const { parameters } = sigleClient.setProfile({
      metadata: `ar://${data.id}`,
    });

    const contractCallResult = await contractCall(parameters);
    if (contractCallResult.isErr()) {
      setStepError("transaction", contractCallResult.error.message);
      return;
    }

    const txId = contractCallResult.value;
    const transactionResult = await waitForTransaction({ txId });
    if (transactionResult.isErr()) {
      setStepError("transaction", transactionResult.error.message);
      return;
    }
    if (transactionResult.value.tx_status !== "success") {
      setStepError("transaction", "Transaction failed");
      return;
    }
    completeStep("transaction");

    try {
      await triggerIndexing.mutateAsync({});
    } catch (error) {
      setStepError(
        "index",
        error instanceof Error ? error.message : "Failed to trigger indexing",
      );
      return;
    }

    const pollingInterval = 2_000;
    const timeout = 180_000;
    const startTime = Date.now();

    let isIndexed = false;
    while (Date.now() - startTime < timeout) {
      const result = await refetchProfile.refetch();

      // Successfully indexed
      if (result.data?.profile?.txId === txId) {
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

    // TODO success message in the multi step with close button
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
          <Button type="submit" disabled={isSubmitting}>
            {isSubmitting ? <Spinner data-icon="inline-start" /> : null}
            Save
          </Button>
        </Field>
      </FieldGroup>
    </form>
  );
};
