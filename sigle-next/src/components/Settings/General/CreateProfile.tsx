import { graphql, useMutation } from 'react-relay';
import { useEffect, useRef } from 'react';
import * as Sentry from '@sentry/nextjs';
import { Flex, LoadingSpinner } from '@sigle/ui';
import { CreateProfileMutation } from '@/__generated__/relay/CreateProfileMutation.graphql';
import { trpc } from '@/utils/trpc';

export const SettingsCreateProfile = () => {
  const utils = trpc.useContext();
  const isMounted = useRef(false);

  const [commitCreateProfile, isLoadingCommitCreateProfile] =
    useMutation<CreateProfileMutation>(graphql`
      mutation CreateProfileMutation($input: CreateProfileInput!) {
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

  useEffect(() => {
    // Prevent useEffect from running twice with react strict mode
    if (isMounted.current) return;
    isMounted.current = true;

    commitCreateProfile({
      variables: {
        input: {
          content: {},
        },
      },
      onCompleted: (data, errors) => {
        if (errors) {
          // TODO toast error
          Sentry.captureMessage('Error creating profile', {
            extra: { errors },
          });
          console.error(errors);
          return;
        }
        if (data.createProfile) {
          utils.userProfile.invalidate();
        }
      },
    });
  }, [commitCreateProfile]);

  return (
    <Flex justify="center" mt="4">
      <LoadingSpinner />
    </Flex>
  );
};
