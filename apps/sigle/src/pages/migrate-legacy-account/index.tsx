import React, { useEffect, useState } from 'react';
import { StacksMainnet } from '@stacks/network';
import { useRouter } from 'next/router';
import { useAuth } from '@/modules/auth/AuthContext';
import { LoginLayout } from '@/modules/layout/components/LoginLayout';
import { Button, Heading, Text, TextFieldInput } from '@radix-ui/themes';
import { CheckIcon } from '@radix-ui/react-icons';
import { generateWallet, restoreWalletAccounts } from '@stacks/wallet-sdk';
import { getAddressFromPrivateKey } from '@stacks/transactions';
import { TransactionVersion } from '@stacks/common';
import {
  BnsGetNameInfoResponse,
  NamesApi,
} from '@stacks/blockchain-api-client';
import { resolveZoneFileToProfile } from '@stacks/profile';
import { fetchPublicStories, fetchSettings } from '@/utils/gaia/fetch';

const MigrateLegacyAccount = () => {
  const router = useRouter();
  const { user, loggingIn } = useAuth();
  const [formState, setFormState] = useState<{
    seed: string;
    username: string;
    loading: boolean;
    error?: string;
  }>({
    seed: '',
    username: '',
    loading: false,
  });
  const [logs, setLogs] = useState<string[]>([]);

  useEffect(() => {
    // If user is not logged him redirect him to the login page
    if (!loggingIn && !user) {
      router.push(`/login`);
      return;
    }
  }, [loggingIn, router, user]);

  const handleMigration = async () => {
    setLogs([]);
    setFormState({ ...formState, loading: true });
    const { seed, username } = formState;
    const numberOfWords = seed.split(' ').length;
    if (numberOfWords !== 12) {
      setFormState({
        ...formState,
        loading: false,
        error: 'Seed phrase must contain 12 words',
      });
      return;
    }
    if (!username.endsWith('.id.blockstack') && !username.endsWith('.id.stx')) {
      setFormState({
        ...formState,
        loading: false,
        error: 'Username must end with .id.blockstack or .id.stx',
      });
      return;
    }

    // Extract the legacy accounts from the seed phrase
    setLogs((logs) => [...logs, 'Extracting legacy accounts...']);
    const baseWallet = await generateWallet({
      secretKey: seed,
      password: '',
    });
    const network = new StacksMainnet();
    const txVersion = TransactionVersion.Mainnet;
    const wallet = await restoreWalletAccounts({
      wallet: baseWallet,
      gaiaHubUrl: 'https://hub.blockstack.org',
      network: network,
    });

    // Find the legacy account attached to the username
    let nameInfo: BnsGetNameInfoResponse | null = null;
    try {
      const stacksNamesApi = new NamesApi();
      nameInfo = await stacksNamesApi.getNameInfo({ name: username });
    } catch (error) {
      setLogs((logs) => [
        ...logs,
        `Failed to fetch name info: ${error.message}`,
      ]);
      setFormState({ ...formState, loading: false });
      return;
    }

    const accounts = wallet.accounts
      .map((account) => [
        // Duplicate accounts (taking once as uncompressed, once as compressed)
        { ...account, dataPrivateKey: account.dataPrivateKey },
        { ...account, dataPrivateKey: account.dataPrivateKey + '01' },
      ])
      .flat();

    const account = accounts.find(
      (account) =>
        getAddressFromPrivateKey(account.dataPrivateKey, txVersion) ===
        nameInfo?.address,
    );
    if (!account) {
      setLogs((logs) => [
        ...logs,
        `No legacy account found matching address ${nameInfo?.address}`,
      ]);
      setFormState({ ...formState, loading: false });
      return;
    }

    // Fetch the legacy account Gaia info
    let userProfile: undefined | { apps?: Record<string, string> };
    try {
      if (nameInfo) {
        userProfile = await resolveZoneFileToProfile(
          nameInfo.zonefile,
          nameInfo.address,
        );
      }
    } catch (error) {
      setLogs((logs) => [
        ...logs,
        `resolveZoneFileToProfile returned error: ${error.message}`,
      ]);
      setFormState({ ...formState, loading: false });
      return;
    }
    console.log(userProfile);
    const bucketUrl = userProfile?.apps?.['https://app.sigle.io'];
    if (!bucketUrl) {
      setLogs((logs) => [...logs, `No bucket URL found for ${username}`]);
      setFormState({ ...formState, loading: false });
      return;
    }

    const [dataPublicStories, dataSettings] = await Promise.all([
      fetchPublicStories(bucketUrl),
      fetchSettings(bucketUrl),
    ]);
    setLogs((logs) => [
      ...logs,
      `Found ${dataPublicStories.file.stories.length} public stories, ${
        dataSettings ? 'settings found' : 'no settings found'
      }, starting to migrate data...`,
    ]);

    // Authenticate legacy account to Gaia

    setFormState({ ...formState, loading: false });
  };

  if (!user) return null;

  return (
    <LoginLayout>
      <div className="space-y-2 ">
        <Heading as="h1" weight="medium">
          Migrate legacy account
        </Heading>
        <Text as="p">
          Please make sure you know what you are doing. All the data associated
          with <b>{user.username}</b> will be deleted,{' '}
          <b>this action is irreversible</b>.
        </Text>
        <Text as="p" size="1" color="gray">
          Enter your legacy account 12 words seed phrase
        </Text>
        <TextFieldInput
          placeholder="enter 12 words seed phrase"
          value={formState.seed}
          onChange={(e) => setFormState({ ...formState, seed: e.target.value })}
        />
        <Text as="p" size="1" color="gray">
          Enter your legacy username (xx.id.stx or xx.id.blockstack)
        </Text>
        <TextFieldInput
          placeholder="enter legacy username"
          value={formState.username}
          onChange={(e) =>
            setFormState({ ...formState, username: e.target.value })
          }
        />
        {formState.error ? (
          <Text as="p" size="2" color="red">
            {formState.error}
          </Text>
        ) : null}
        <div className="flex justify-end">
          <Button onClick={handleMigration} disabled={formState.loading}>
            <CheckIcon />
            Migrate
          </Button>
        </div>
        {logs.length > 0 ? (
          <div className="space-y-2">
            <Heading as="h2" size="2" weight="medium">
              Logs
            </Heading>
            <div className="space-y-1">
              {logs.map((log, index) => (
                <Text as="p" size="1" key={index}>
                  {log}
                </Text>
              ))}
            </div>
          </div>
        ) : null}
      </div>
    </LoginLayout>
  );
};

export default MigrateLegacyAccount;
