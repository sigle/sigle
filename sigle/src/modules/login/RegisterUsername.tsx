import { useState } from 'react';
import { useRouter } from 'next/router';
import { makeProfileZoneFile } from '@stacks/profile';
import posthog from 'posthog-js';
import * as Fathom from 'fathom-client';
import {
  validateSubdomainFormat,
  IdentityNameValidityError,
} from '@stacks/keychain';
import { Box, Button, Heading, Text } from '../../ui';
import { useAuth } from '../auth/AuthContext';
import { Goals } from '../../utils/fathom';

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

export const RegisterUsername = () => {
  const router = useRouter();
  const { user, setUsername } = useAuth();

  const [formState, setFormState] = useState<FormState>({
    username: '',
    loading: false,
  });

  // TODO loading indicator as the request can take some time @greg

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

    const response = await fetch(`${registrarUrl}/register`, {
      method: 'POST',
      headers: {
        Accept: 'application/json',
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        name: username,
        owner_address: user.profile.stxAddress.mainnet,
        zonefile: zoneFile,
      }),
    });

    const json = await response.json();

    if (!response.ok || !json.status) {
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
    <>
      <Heading as="h1" size="2xl" css={{ mt: '$15' }}>
        One last step!
      </Heading>
      <Text css={{ mt: '$1' }}>Choose a username.</Text>

      <Box as="form" onSubmit={handleSubmit} css={{ width: '100%' }}>
        <Box
          css={{
            width: '100%',
            backgroundColor: '$gray3',
            br: '$1',
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            mt: '$8',
            px: '$3',
            py: '$2',
            '@lg': {
              flexDirection: 'row',
            },
          }}
        >
          <Box
            as="input"
            placeholder="Enter your username..."
            type="text"
            id="username"
            name="username"
            required={true}
            disabled={formState.loading}
            value={formState.username}
            onChange={(event: any) =>
              setFormState({ username: event.target.value, loading: false })
            }
            css={{
              backgroundColor: 'transparent !important',
              textAlign: 'center',
              flex: 1,
              width: '100%',
              outline: 'none',
              border: 'none',
              py: '$2',
              '@lg': {
                px: 0,
                mr: '$1',
                textAlign: 'left',
                width: 'auto',
              },
            }}
          />
          <Button
            type="submit"
            css={{
              mt: '$2',
              width: '100%',
              '@lg': {
                mt: 0,
                width: 'auto',
              },
            }}
            size="lg"
            color="orange"
            disabled={formState.loading}
          >
            Submit
          </Button>
        </Box>
        <Text
          size="sm"
          css={{
            mt: '$2',
            color: '#cd2b31',
          }}
        >
          {formState.errorMessage}
        </Text>
      </Box>
    </>
  );
};
