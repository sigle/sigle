import { useCeramic } from '@/components/Ceramic/CeramicProvider';
import { DashboardLayout } from '@/components/Dashboard/DashboardLayout';
import { environment } from '@/lib/relay';
import { TooltipProvider } from '@radix-ui/react-tooltip';
import { graphql, useLazyLoadQuery, useMutation } from 'react-relay';
import { styled } from '@sigle/stitches.config';
import { Button, Container, Flex, Input, Typography } from '@sigle/ui';
import { TbBrandTwitter, TbWorld } from 'react-icons/tb';
import { useForm } from 'react-hook-form';
import { settingsPageProfileQuery } from '@/__generated__/relay/settingsPageProfileQuery.graphql';
import { settingsCreateProfileMutation } from '@/__generated__/relay/settingsCreateProfileMutation.graphql';
import { settingsUpdateProfileMutation } from '@/__generated__/relay/settingsUpdateProfileMutation.graphql';
import { fetchQuery } from 'relay-runtime';
import { useEffect } from 'react';

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

const Textarea = styled('textarea', {
  color: '$gray11',
  border: '1px solid $gray8',
  backgroundColor: '$gray1',
  borderRadius: '$sm',
  fontSize: '$sm',
  lineHeight: '$sm',
  py: '$2',
  px: '$3',
  outline: 'none',
  transition: 'all 75ms $ease-in',

  '::placeholder': {
    color: '$gray8',
  },

  '&:hover': {
    border: '1px solid $gray9',
  },

  '&:focus': {
    border: '1px solid $indigo8',
    boxShadow: '0px 0px 0px 3px rgba(145, 139, 255, 0.3)',
  },
});

type SettingsFormData = {
  displayName?: string | null;
  description?: string | null;
  websiteUrl?: string | null;
  twitterUsername?: string | null;
};

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

  const {
    register,
    handleSubmit,
    formState: { isDirty },
  } = useForm<SettingsFormData>({
    values: {
      displayName: data.viewer?.profile?.displayName,
      description: data.viewer?.profile?.description,
      websiteUrl: data.viewer?.profile?.websiteUrl,
      twitterUsername: data.viewer?.profile?.twitterUsername,
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

  console.log(isLoadingCommitCreateProfile, isLoadingCommitUpdateProfile);

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
            // TODO report Sentry
            console.error(errors);
            return;
          }
          fetchQuery(environment, SettingsPageProfileQuery, {}).subscribe({
            error: (error: Error) => {
              // TODO toast error
              // TODO report Sentry
              console.error(error);
            },
          });
        },
      });
    }
  }, [data.viewer?.profile]);

  const onSubmit = handleSubmit((formValues) => {
    // TODO: add validation

    const profileId = data.viewer?.profile?.id;
    console.log('profileId', profileId);
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
          // TODO report Sentry
          return;
        }
        // TODO toast success
      },
    });
  });

  console.log(data);

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
                placeholder="@sigleapp"
                rightIcon={<TbBrandTwitter />}
                {...register('twitterUsername')}
              />
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
