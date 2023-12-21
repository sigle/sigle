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

const MigrateLegacyAccount = () => {
  const router = useRouter();
  const { user, loggingIn } = useAuth();

  useEffect(() => {
    // If user is not logged him redirect him to the login page
    if (!loggingIn && !user) {
      router.push(`/login`);
      return;
    }
  }, [loggingIn, router, user]);

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
        <TextFieldInput placeholder="enter 12 words seed phrase" />
        <div className="flex justify-end">
          <Button>
            <CheckIcon />
            Migrate
          </Button>
        </div>
      </div>
    </LoginLayout>
  );
};

export default MigrateLegacyAccount;
