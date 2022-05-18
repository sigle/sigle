import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/router';
import {
  validateSubdomainFormat,
  IdentityNameValidityError,
} from '@stacks/keychain';
import { makeProfileZoneFile } from '@stacks/profile';
import posthog from 'posthog-js';
import * as Fathom from 'fathom-client';
import { Button, Flex, Heading, Text } from '../ui';
import { LoginLayout } from '../modules/layout/components/LoginLayout';
import { keyframes, styled } from '../stitches.config';
import { QuestionMarkCircledIcon } from '@radix-ui/react-icons';
import { useAuth } from '../modules/auth/AuthContext';
import { Goals } from '../utils/fathom';

interface HubInfo {
  challenge_text?: string;
  read_url_prefix: string;
}

const getHubInfo = async (hubUrl: string) => {
  const response = await fetch(`${hubUrl}/hub_info`);
  const data: HubInfo = await response.json();
  return data;
};

const identityNameLengthError =
  // TODO check if 8 min and 37 max are
  'Your username should be at least 8 characters, with a maximum of 37 characters.';
const identityNameIllegalCharError =
  'You can only use lowercase letters (a–z), numbers (0–9), and underscores (_).';
const identityNameUnavailableError = 'This username is not available.';
const errorTextMap = {
  [IdentityNameValidityError.MINIMUM_LENGTH]: identityNameLengthError,
  [IdentityNameValidityError.MAXIMUM_LENGTH]: identityNameLengthError,
  [IdentityNameValidityError.ILLEGAL_CHARACTER]: identityNameIllegalCharError,
  [IdentityNameValidityError.UNAVAILABLE]: identityNameUnavailableError,
};

const registrarUrl = 'https://registrar.stacks.co';

const validateSubdomainAvailability = async (
  name: string,
  subdomain: string
) => {
  try {
    const url = `${registrarUrl}/v1/names/${name.toLowerCase()}.${subdomain}`;
    const resp = await fetch(url);
    const data = await resp.json();
    if (data.status !== 'available') {
      return IdentityNameValidityError.UNAVAILABLE;
    }
    return null;
  } catch (error) {
    return IdentityNameValidityError.UNAVAILABLE;
  }
};

interface FormState {
  username: string;
  loading: boolean;
  errorMessage?: string;
}

const subdomain = 'id.stx';

const spin = keyframes({
  to: { transform: 'rotate(360deg)' },
});

const LoadingSpinner = styled('div', {
  position: 'relative',
  px: '$4',

  '&::before': {
    content: '',
    boxSizing: 'border-box',
    position: 'absolute',
    top: '50%',
    left: '50%',
    width: '$4',
    height: '$4',
    mt: '-8px',
    ml: '-8px',
    br: '$round',
    border: '1px solid $colors$gray8',
    borderTopColor: '$gray11',
    animation: `${spin} .7s linear infinite`,
  },
});

const ControlGroup = styled('div', {
  display: 'flex',
  justifyContent: 'space-between',
  backgroundColor: '$gray3',
  boxShadow: '0 0 0 1px $colors$gray7',
  borderRadius: '$1',
  minWidth: 320,
  gap: '$3',
  pr: '$2',
  pl: '$3',
  py: '$2',
  mb: '$4',

  '&:hover': {
    backgroundColor: '$gray4',
    boxShadow: '0 0 0 1px $colors$gray8',
  },

  '&:focus-within': {
    boxShadow: '0 0 0 2px $colors$gray8',
  },
});

const FormInput = styled('input', {
  width: '100%',
  outline: 'none',
  backgroundColor: 'transparent',
  fontSize: '$2',
  color: '$gray11',

  '&::placeholder': {
    color: '$gray9',
  },
});

const RegisterUsername = () => {
  const router = useRouter();
  const { user, loggingIn, setUsername } = useAuth();
  const [formState, setFormState] = useState<FormState>({
    username: '',
    loading: false,
  });

  useEffect(() => {
    // If user is not logged him redirect him to the login page
    if (!loggingIn && !user) {
      router.push(`/login`);
      return;
    }
    // If user already has a username we redirect him to the homepage
    if (user && user.username) {
      router.push(`/`);
      return;
    }
  }, [loggingIn, router, user]);

  const handleSubmit: React.FormEventHandler<HTMLFormElement> = async (
    event
  ) => {
    event.preventDefault();
    if (!user) {
      return;
    }

    posthog.capture('username-submitted');

    setFormState((state) => ({
      ...state,
      loading: true,
      errorMessage: undefined,
    }));

    const validationErrors = validateSubdomainFormat(formState.username);
    if (validationErrors !== null) {
      posthog.capture('username-validation-error');
      setFormState((state) => ({
        ...state,
        loading: false,
        errorMessage: errorTextMap[validationErrors],
      }));
      return;
    }

    const validityError = await validateSubdomainAvailability(
      formState.username,
      subdomain
    );
    if (validityError !== null) {
      posthog.capture('username-validation-error');
      setFormState((state) => ({
        ...state,
        loading: false,
        errorMessage: errorTextMap[validityError],
      }));
      return;
    }

    const username = formState.username;
    const fullUsername = `${username}.${subdomain}`;
    const gaiaUrl = user.hubUrl;
    const btcAddress = user.identityAddress;
    if (!btcAddress) {
      posthog.capture('username-btc-address-error');
      setFormState((state) => ({
        ...state,
        loading: false,
        errorMessage: 'identity address is empty.',
      }));
      return;
    }

    let hubInfo: HubInfo;
    try {
      hubInfo = await getHubInfo(gaiaUrl);
    } catch (error) {
      posthog.capture('username-hub-info-error', { error });
      setFormState((state) => ({
        ...state,
        loading: false,
        errorMessage: 'Failed to fetch hub info.',
      }));
      return;
    }
    const profileUrl = `${hubInfo.read_url_prefix}${btcAddress}/profile.json`;
    const zoneFile = makeProfileZoneFile(fullUsername, profileUrl);

    const body = {
      name: username,
      owner_address: user.profile.stxAddress.mainnet,
      zonefile: zoneFile,
    };
    const response = await fetch(`${registrarUrl}/register`, {
      method: 'POST',
      headers: {
        Accept: 'application/json',
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(body),
    });

    const json = await response.json();

    if (!response.ok || !json.status) {
      console.error('Failed to register username', json, body, user);
      posthog.capture('username-registration-error', {
        status: response.status,
        json,
      });
      setFormState((state) => ({
        ...state,
        loading: false,
        errorMessage: `Failed to register username with message "${json.message}"`,
      }));
      return;
    }

    posthog.capture('username-registration-success');
    Fathom.trackGoal(Goals.FREE_USERNAME_CREATED, 0);

    /**
     * After the request was sent to the registrar, while the tx is being processed,
     * and not yet included in the blockchain, the endpoint "https://stacks-node-api.stacks.co/v1/addresses/stacks/${address}"
     * which we use to get the username will return a empty username array.
     * To solve this issue, we store the username in the local storage.
     * The dashboard will notify the user that the username is being processed.
     * Once the tx is included in the blockchain, the endpoint will return the username.
     * At this step, we can remove the username from the local storage safely. This is handled
     * in the AuthContext file logic.
     */
    const address = user.profile.stxAddress.mainnet;
    localStorage.setItem(`sigle-username-${address}`, fullUsername);
    setUsername(fullUsername);

    router.push(`/`);
  };

  return (
    <LoginLayout>
      <Heading
        as="h1"
        size="2xl"
        css={{
          mt: '$5',
          fontWeight: '600',
        }}
      >
        One last step
      </Heading>
      <Text
        css={{
          mt: '$2',
          mb: '$3',
          color: '$gray10',
        }}
      >
        Choose a .id.stx username
      </Text>
      <form onSubmit={handleSubmit}>
        <ControlGroup role="group">
          <FormInput
            disabled={formState.loading}
            placeholder="johndoe.id.stx"
            onChange={(event) =>
              setFormState({ username: event.target.value, loading: false })
            }
          />
          <Button
            disabled={formState.loading}
            variant={formState.loading ? 'ghost' : 'solid'}
            color="orange"
            css={{
              display: formState.loading ? 'flex' : 'block',
              justifyContent: 'space-between',
              pointerEvents: formState.loading ? 'none' : 'auto',
            }}
          >
            {formState.loading ? <LoadingSpinner /> : 'Submit'}
          </Button>
        </ControlGroup>
      </form>
      <Flex css={{ mb: '$5' }} align="center" gap="5">
        {!formState.loading && !formState.errorMessage ? (
          <>
            <Text
              css={{
                color: '$orange11',
                '&:hover': { boxShadow: '0 1px 0 0' },
              }}
              size="sm"
              as="a"
              href="https://btc.us/"
              target="_blank"
              rel="noreferrer"
            >
              Or buy a .BTC domain instead
            </Text>
            <Text
              as="a"
              color="orange"
              href="https://docs.sigle.io/"
              target="_blank"
              rel="noreferrer"
              aria-label="Learn more"
            >
              <QuestionMarkCircledIcon />
            </Text>
          </>
        ) : null}
        {formState.loading ? (
          <Text size="sm">Your username is being created. Please wait...</Text>
        ) : null}
        {formState.errorMessage ? (
          <Text size="sm" color="orange">
            {formState.errorMessage}
          </Text>
        ) : null}
      </Flex>
    </LoginLayout>
  );
};

export default RegisterUsername;
