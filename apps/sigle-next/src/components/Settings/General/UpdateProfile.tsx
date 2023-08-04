import { zodResolver } from '@hookform/resolvers/zod';
import { useForm } from 'react-hook-form';
import { TbBrandTwitter, TbWorld } from 'react-icons/tb';
import { graphql, useMutation } from 'react-relay';
import { z } from 'zod';
import { useState } from 'react';
import * as Sentry from '@sentry/nextjs';
import {
  Button,
  Container,
  Flex,
  Input,
  Textarea,
  Typography,
} from '@sigle/ui';
import { styled } from '@sigle/stitches.config';
import { UpdateProfileMutation } from '@/__generated__/relay/UpdateProfileMutation.graphql';
import { CeramicProfile } from '@/types/ceramic';
import { trpc } from '@/utils/trpc';
import { DashboardLayout } from '@/components/Dashboard/DashboardLayout';
import { useToast } from '@/hooks/useToast';
import { SettingsMenu } from '../SettingsMenu';

const TitleRow = styled('div', {
  py: '$5',
});

const SettingsRow = styled(Flex, {
  py: '$5',
  borderTop: '1px solid $gray6',
  justifyContent: 'space-between',
  gap: '$2',
  display: 'grid',
  gridTemplateColumns: '1fr',
  '@md': {
    gridTemplateColumns: '1fr 2fr',
  },
});

const settingsSchema = z.object({
  displayName: z.string().optional(),
  description: z.string().optional(),
  websiteUrl: z.union([z.string().trim().url().optional(), z.literal('')]),
  twitterUsername: z.union([
    z
      .string()
      .regex(/^@?(\w){1,15}$/, 'Invalid Twitter username')
      .optional(),
    z.literal(''),
  ]),
});

type SettingsFormData = z.infer<typeof settingsSchema>;

export const SettingsUpdateProfile = ({
  profile,
}: {
  profile: CeramicProfile;
}) => {
  const utils = trpc.useContext();
  const { toast } = useToast();
  const [isFetching, setIsFetching] = useState(false);

  const [commit, isLoadingCommitUpdateProfile] =
    useMutation<UpdateProfileMutation>(graphql`
      mutation UpdateProfileMutation($input: UpdateProfileInput!) {
        updateProfile(input: $input) {
          clientMutationId
          document {
            id
            displayName
            websiteUrl
            description
            twitterUsername
          }
        }
      }
    `);

  const {
    register,
    handleSubmit,
    setValue,
    formState: { isDirty, errors },
  } = useForm<SettingsFormData>({
    resolver: zodResolver(settingsSchema),
    values: {
      displayName: profile.displayName ?? undefined,
      description: profile.description ?? undefined,
      websiteUrl: profile.websiteUrl ?? undefined,
      twitterUsername: profile.twitterUsername ?? undefined,
    },
  });

  const onSubmit = handleSubmit((formValues) => {
    commit({
      variables: {
        input: {
          id: profile.id,
          content: {
            displayName: formValues.displayName || undefined,
            description: formValues.description || undefined,
            websiteUrl: formValues.websiteUrl || undefined,
            twitterUsername: formValues.twitterUsername || undefined,
          },
        },
      },
      onCompleted: (data, errors) => {
        if (errors) {
          Sentry.captureMessage('Error updating profile', {
            extra: { errors },
          });
          console.error(errors);
          toast({
            description: `Error updating profile: ${errors[0].message}`,
            variant: 'error',
          });
          return;
        }
        if (data.updateProfile) {
          setIsFetching(true);
          utils.invalidate().then(() => {
            toast({
              description: 'Profile updated',
            });
            setIsFetching(false);
          });
        }
      },
    });
  });

  return (
    <DashboardLayout
      headerContent={
        <Flex justify="between" align="center" css={{ flex: 1 }}>
          <Typography size="xl" fontWeight="bold">
            Settings
          </Typography>
          <Button
            onClick={onSubmit}
            disabled={!isDirty || isLoadingCommitUpdateProfile || isFetching}
          >
            {isLoadingCommitUpdateProfile ? 'Saving...' : 'Saved'}
          </Button>
        </Flex>
      }
    >
      <Container css={{ maxWidth: 770, py: '$5' }}>
        <SettingsMenu />
        <form onSubmit={onSubmit} className="mt-5">
          <TitleRow>
            <Typography size="xl" fontWeight="bold">
              My profile
            </Typography>
            <Typography size="sm" color="gray9">
              Customize your profile to be recognized on Sigle
            </Typography>
          </TitleRow>
          <SettingsRow>
            <Typography size="sm" fontWeight="semiBold">
              Public name
            </Typography>
            <Flex direction="column" gap="2">
              <Input placeholder="Name" {...register('displayName')} />
              <Typography size="xs" color="gray9">
                This name will be displayed on your profile page
              </Typography>
            </Flex>
          </SettingsRow>
          <SettingsRow justify="between">
            <Typography size="sm" fontWeight="semiBold">
              Present yourself
            </Typography>
            <Flex direction="column" gap="2">
              <Textarea
                placeholder="Description"
                rows={4}
                maxLength={350}
                {...register('description')}
              />
              <Typography size="xs" color="gray9">
                Max. 350 characters
              </Typography>
            </Flex>
          </SettingsRow>

          <TitleRow>
            <Typography size="xl" fontWeight="bold">
              Social links
            </Typography>
            <Typography size="sm" color="gray9">
              Add links to your social networks to be displayed on your profile
            </Typography>
          </TitleRow>
          <SettingsRow>
            <Typography size="sm" fontWeight="semiBold">
              Website
            </Typography>
            <Flex direction="column" gap="2">
              <Input
                placeholder="https://www.sigle.io"
                rightIcon={<TbWorld />}
                {...register('websiteUrl')}
              />
              {errors.websiteUrl ? (
                <Typography size="xs" color="orange">
                  {errors.websiteUrl.message}
                </Typography>
              ) : null}
              <Typography size="xs" color="gray9">
                Enter your personal website
              </Typography>
            </Flex>
          </SettingsRow>
          <SettingsRow>
            <Typography size="sm" fontWeight="semiBold">
              Twitter
            </Typography>
            <Flex direction="column" gap="2">
              <Input
                placeholder="sigleapp"
                rightIcon={<TbBrandTwitter fill="currentColor" stroke="0" />}
                {...register('twitterUsername')}
                onChange={(e) => {
                  let value = e.target.value;
                  if (value.startsWith('@')) {
                    value = value.slice(1);
                  } else if (value.startsWith('https://twitter.com/')) {
                    value = value.slice('https://twitter.com/'.length);
                  }
                  setValue('twitterUsername', value, {
                    shouldValidate: true,
                    shouldDirty: true,
                  });
                }}
              />
              {errors.twitterUsername ? (
                <Typography size="xs" color="orange">
                  {errors.twitterUsername.message}
                </Typography>
              ) : null}
              <Typography size="xs" color="gray9">
                Enter your twitter username
              </Typography>
            </Flex>
          </SettingsRow>
        </form>
      </Container>
    </DashboardLayout>
  );
};
