import { sigleApiClient } from '@/__generated__/sigle-api';
import type { paths } from '@/__generated__/sigle-api/openapi';
import { zodResolver } from '@hookform/resolvers/zod';
import { Button, Flex, Text, TextArea, TextField } from '@radix-ui/themes';
import { createProfileMetadata } from '@sigle/sdk';
import { IconAt, IconBrandX } from '@tabler/icons-react';
import { useForm } from 'react-hook-form';
import { toast } from 'sonner';
import { z } from 'zod';
import { UploadProfilePicture } from './UploadProfilePicture';
import { UploadProfileCoverPicture } from './UploadProfileCoverPicture';
import { useContractCall } from '@/hooks/useContractCall';
import {
  getExplorerTransactionUrl,
  getPromiseTransactionConfirmation,
} from '@/lib/stacks';
import { sigleClient } from '@/lib/sigle';

const updateProfileMetadataSchema = z.object({
  displayName: z.string().optional(),
  description: z.string().optional(),
  website: z.string().url().optional().or(z.literal('')),
  twitter: z.string().optional(),
  picture: z.string().optional(),
  coverPicture: z.string().optional(),
});

type UpdateProfileMetadataFormData = z.infer<
  typeof updateProfileMetadataSchema
>;

interface UpdateProfileMetadataProps {
  profile: paths['/api/users/{username}']['get']['responses']['200']['content']['application/json']['profile'];
  setEditingProfileMetadata: (editing: boolean) => void;
}

export const UpdateProfileMetadata = ({
  profile,
  setEditingProfileMetadata,
}: UpdateProfileMetadataProps) => {
  const { mutateAsync: uploadProfileMetadata } = sigleApiClient.useMutation(
    'post',
    '/api/protected/user/profile/upload-metadata',
    {
      onError: (error: any) => {
        toast.error('Failed to update profile', {
          description: error.message,
        });
      },
    },
  );

  const { contractCall } = useContractCall({
    onSuccess: (data) => {
      toast.promise(getPromiseTransactionConfirmation(data.txId), {
        loading: 'Update profile transaction submitted',
        success: 'Profile updated successfully',
        error: 'Transaction failed',
        action: {
          label: 'View tx',
          onClick: () =>
            window.open(getExplorerTransactionUrl(data.txId), '_blank'),
        },
      });
    },
    onError: (error) => {
      toast.error('Failed to collect', {
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
  } = useForm<UpdateProfileMetadataFormData>({
    resolver: zodResolver(updateProfileMetadataSchema),
    values: {
      displayName: profile?.displayName || undefined,
      description: profile?.description || undefined,
      picture: profile?.pictureUri || undefined,
      coverPicture: profile?.coverPictureUri || undefined,
      website: profile?.website || undefined,
      twitter: profile?.twitter || undefined,
    },
  });

  const onSubmit = handleSubmit(async (formValues) => {
    const metadata = createProfileMetadata({
      // TODO: add random id
      id: 'TODO',
      displayName: formValues.displayName || undefined,
      description: formValues.description || undefined,
      twitter: formValues.twitter || undefined,
      website: formValues.website || undefined,
      picture: formValues.picture || undefined,
      coverPicture: formValues.coverPicture || undefined,
    });

    const data = await uploadProfileMetadata({
      body: {
        metadata: metadata as any,
      },
    });

    const { parameters } = sigleClient.setProfile({ metadata: data.url });

    await contractCall(parameters);

    setEditingProfileMetadata(false);
  });

  const handleXChange: React.ChangeEventHandler<HTMLInputElement> = (event) => {
    let value = event.target.value;
    // If user pastes a full url, extract the username
    if (value.startsWith('http')) {
      value = value.split('/').pop() || '';
    }
    setValue('twitter', value, { shouldValidate: true });
  };

  return (
    <form onSubmit={onSubmit} className="space-y-4">
      <div className="space-y-3">
        <div className="space-y-1">
          <Text as="div" size="2">
            Name
          </Text>
          <TextField.Root
            placeholder="Your name"
            {...register('displayName')}
          />
          {errors.displayName && (
            <Text as="div" size="1" color="red" mt="1">
              {errors.displayName.message}
            </Text>
          )}
        </div>

        <div className="space-y-1">
          <Text as="div" size="2">
            Description - Markdown supported (limited to bold, italic, links)
          </Text>
          <TextArea
            placeholder="Describe yourself in a few words (supports markdown)"
            rows={4}
            {...register('description')}
          />
          {errors.description && (
            <Text as="div" size="1" color="red" mt="1">
              {errors.description.message}
            </Text>
          )}
        </div>

        <div className="space-y-1">
          <Text as="div" size="2">
            Website
          </Text>
          <TextField.Root
            placeholder="https://sigle.io"
            {...register('website')}
          />
          {errors.website && (
            <Text as="div" size="1" color="red" mt="1">
              {errors.website.message}
            </Text>
          )}
        </div>

        <div className="space-y-1">
          <Text as="div" size="2" className="flex items-center gap-1">
            <IconBrandX height="16" width="16" /> (Twitter)
          </Text>
          <TextField.Root
            placeholder="username"
            {...register('twitter')}
            onChange={handleXChange}
          >
            <TextField.Slot>
              <IconAt height="16" width="16" />
            </TextField.Slot>
          </TextField.Root>
          {errors.twitter && (
            <Text as="div" size="1" color="red" mt="1">
              {errors.twitter.message}
            </Text>
          )}
        </div>
      </div>

      <UploadProfilePicture
        picture={getValues('picture')}
        setPicture={(value) =>
          setValue('picture', value, { shouldValidate: true })
        }
      />

      <UploadProfileCoverPicture
        picture={getValues('coverPicture')}
        setPicture={(value) =>
          setValue('coverPicture', value, { shouldValidate: true })
        }
      />

      <Flex gap="3" justify="end">
        <Button
          variant="soft"
          color="gray"
          type="button"
          disabled={isSubmitting}
          onClick={() => setEditingProfileMetadata(false)}
        >
          Cancel
        </Button>
        <Button type="submit" loading={isSubmitting}>
          Save
        </Button>
      </Flex>
    </form>
  );
};
