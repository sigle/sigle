import { TooltipProvider } from '@radix-ui/react-tooltip';
import {
  graphql,
  useLazyLoadQuery,
  useMutation,
  useRelayEnvironment,
} from 'react-relay';
import { TbBrandTwitter, TbWorld } from 'react-icons/tb';
import { useForm } from 'react-hook-form';
import { fetchQuery } from 'relay-runtime';
import { useEffect } from 'react';
import * as Sentry from '@sentry/nextjs';
import {
  Button,
  Container,
  Flex,
  Input,
  Typography,
  Textarea,
} from '@sigle/ui';
import { styled } from '@sigle/stitches.config';
import { settingsPageProfileQuery } from '@/__generated__/relay/settingsPageProfileQuery.graphql';
import { settingsCreateProfileMutation } from '@/__generated__/relay/settingsCreateProfileMutation.graphql';
import { settingsUpdateProfileMutation } from '@/__generated__/relay/settingsUpdateProfileMutation.graphql';
import { DashboardLayout } from '@/components/Dashboard/DashboardLayout';
import { useCeramic } from '@/components/Ceramic/CeramicProvider';
import { trpc } from '@/utils/trpc';
import { z } from 'zod';
import { zodResolver } from '@hookform/resolvers/zod';

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
  websiteUrl: z.string().trim().url().optional(),
  twitterUsername: z.union([
    z
      .string()
      .regex(/^@?(\w){1,15}$/, 'Invalid Twitter username')
      .optional(),
    z.literal(''),
  ]),
});

type SettingsFormData = z.infer<typeof settingsSchema>;

const SettingsPageProfileQuery = graphql`
  query settingsPageProfileQuery {
    viewer {
      id
      profile {
        id
        displayName
        description
        websiteUrl
        twitterUsername
      }
    }
  }
`;

const Settings = () => {
  const data = useLazyLoadQuery<settingsPageProfileQuery>(
    SettingsPageProfileQuery,
    {}
  );
  const environment = useRelayEnvironment();
  const utils = trpc.useContext();

  const {
    register,
    handleSubmit,
    setValue,
    formState: { isDirty, errors },
  } = useForm<SettingsFormData>({
    resolver: zodResolver(settingsSchema),
    values: {
      displayName: data.viewer?.profile?.displayName ?? undefined,
      description: data.viewer?.profile?.description ?? undefined,
      websiteUrl: data.viewer?.profile?.websiteUrl ?? undefined,
      twitterUsername: data.viewer?.profile?.twitterUsername ?? undefined,
    },
  });

  const [commitCreateProfile, isLoadingCommitCreateProfile] =
    useMutation<settingsCreateProfileMutation>(graphql`
      mutation settingsCreateProfileMutation($input: CreateProfileInput!) {
        createProfile(input: $input) {
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

  const [commitUpdateProfile, isLoadingCommitUpdateProfile] =
    useMutation<settingsUpdateProfileMutation>(
      graphql`
        mutation settingsUpdateProfileMutation($input: UpdateProfileInput!) {
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
      `
    );

  /**
   * When a user first create an account, there is no profile yet.
   * We need to create one in order to later update it with the data.
   */
  useEffect(() => {
    if (!data.viewer?.profile) {
      commitCreateProfile({
        variables: {
          input: {
            content: {},
          },
        },
        onCompleted: (_, errors) => {
          if (errors) {
            // TODO toast error
            Sentry.captureMessage('Error creating profile', {
              extra: { errors },
            });
            console.error(errors);
            return;
          }
          fetchQuery(environment, SettingsPageProfileQuery, {}).subscribe({
            error: (error: Error) => {
              // TODO toast error
              Sentry.captureException(error);
              console.error(error);
            },
          });
        },
      });
    }
  }, [data.viewer?.profile]);

  const onSubmit = handleSubmit((formValues) => {
    const profileId = data.viewer?.profile?.id;
    if (!profileId) return;

    commitUpdateProfile({
      variables: {
        input: {
          id: data.viewer.profile.id,
          content: {
            displayName: formValues.displayName || undefined,
            description: formValues.description || undefined,
            websiteUrl: formValues.websiteUrl || undefined,
            twitterUsername: formValues.twitterUsername || undefined,
          },
        },
      },
      onCompleted: (_, errors) => {
        if (errors) {
          // TODO toast error
          Sentry.captureMessage('Error updating profile', {
            extra: { errors },
          });
          return;
        }
        utils.invalidate();
        // TODO toast success
      },
    });
  });

  return (
    <DashboardLayout
      headerContent={
        <Flex justify="between" css={{ flex: 1 }}>
          <Typography size="xl" fontWeight="bold">
            Settings
          </Typography>
          <Button
            onClick={onSubmit}
            disabled={
              !isDirty ||
              isLoadingCommitCreateProfile ||
              isLoadingCommitUpdateProfile
            }
          >
            {isLoadingCommitCreateProfile || isLoadingCommitUpdateProfile
              ? 'Saving...'
              : 'Save'}
          </Button>
        </Flex>
      }
    >
      <Container css={{ maxWidth: 770, py: '$5' }}>
        <form onSubmit={onSubmit}>
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

export default function ProtectedSettings() {
  // TODO auth protect
  const { session } = useCeramic();

  return <TooltipProvider>{session ? <Settings /> : null}</TooltipProvider>;
}
