import React, { useEffect, useState } from 'react';
import { StacksMainnet } from '@stacks/network';
import { useConnect } from '@stacks/connect-react';
import { useRouter } from 'next/router';
import { useAuth } from '@/modules/auth/AuthContext';
import { LoginLayout } from '@/modules/layout/components/LoginLayout';
import {
  Button,
  Heading,
  Text,
  TextArea,
  TextFieldInput,
} from '@radix-ui/themes';
import { CheckIcon } from '@radix-ui/react-icons';
import {
  generateNewAccount,
  generateWallet,
  getAppPrivateKey,
  restoreWalletAccounts,
} from '@stacks/wallet-sdk';

const MigrateLegacyAccount = () => {
  const router = useRouter();
  const { user, loggingIn } = useAuth();
  const [formState, setFormState] = useState<{
    seed: string;
    loading: boolean;
    error?: string;
  }>({
    seed: '',
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
    const { seed } = formState;
    const numberOfWords = seed.split(' ').length;
    if (numberOfWords !== 12) {
      setFormState({
        ...formState,
        error: 'Seed phrase must contain 12 words',
      });
      return;
    }

    // Extract the legacy accounts from the seed phrase
    setLogs((logs) => [...logs, 'Extracting legacy accounts...']);
    const baseWallet = await generateWallet({
      secretKey: seed,
      password: '',
    });
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
