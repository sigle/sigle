import { useQuery } from '@tanstack/react-query';
import { useRouter } from 'next/router';
import React, { useState } from 'react';
import * as Sentry from '@sentry/nextjs';
import { toast } from 'react-toastify';
import { Protected } from '../../modules/auth/Protected';
import { getStoryFile } from '../../utils';
import { migrationStory } from '../../utils/migrations/story';
import { DashboardLayout } from '../../modules/layout';
import { Button, Flex, Typography } from '../../ui';
import { useAuth } from '../../modules/auth/AuthContext';
import { appConfig } from '../../utils/blockstack';
import { styled } from '../../stitches.config';
import { useConnect } from '@stacks/connect-react';
import { StacksMainnet } from '@stacks/network';

const StyledCode = styled('code', {
  display: 'block',
  padding: '1rem',
  margin: '1rem 0',
  background: '$gray3',
  borderRadius: '$1',
  fontSize: '$1',
  whiteSpace: 'pre-wrap',
  wordBreak: 'break-word',
  maxHeight: '200px',
  overflow: 'auto',
});

const Inscribe = () => {
  const { user } = useAuth();
  const router = useRouter();
  const { storyId } = router.query as { storyId: string };
  const { sign } = useConnect();
  const [signedData, setSignedData] = useState<string | null>(null);

  const { data } = useQuery(
    ['story', storyId],
    async () => {
      const file = await getStoryFile(storyId);
      return file ? migrationStory(file) : file;
    },
    {
      enabled: Boolean(storyId),
      cacheTime: 0,
      onError: (error: Error | string) => {
        Sentry.captureException(error);
        toast.error(typeof error === 'string' ? error : error.message);
      },
    }
  );

  if (!data) {
    return null;
  }

  const parsedData = {
    p: 'ons',
    op: 'post',
    author: user?.username,
    authorAdress: user?.profile?.stxAddress?.mainnet,
    title: data.title,
    body: data.content,
    url: `${appConfig.appDomain}/${user?.username}/${storyId}`,
    signature: signedData ?? undefined,
  };

  const handleSign = async () => {
    await sign({
      network: new StacksMainnet(),
      message: JSON.stringify(parsedData),
      onFinish: async ({ signature }) => {
        setSignedData(signature);
      },
    });
  };

  const handleCopyClipboard = () => {
    navigator.clipboard.writeText(JSON.stringify(parsedData, null, 2));
    toast.success('Copied to clipboard');
  };

  return (
    <DashboardLayout>
      <Typography size="h2">Inscribe</Typography>
      <StyledCode>{JSON.stringify(parsedData, null, 2)}</StyledCode>
      <Flex gap="5" align="center">
        {!signedData ? (
          <>
            <Typography size="subheading">
              To prove the ownership of the content, we include your address as
              well as a signature. Please sign the message with your wallet.
            </Typography>
            <Button onClick={handleSign}>Sign message</Button>
          </>
        ) : (
          <>
            <Typography size="subheading">
              You can upload an inscription using ord or through a service that
              supports text inscriptions.
            </Typography>
            <Button onClick={handleCopyClipboard}>Copy to clipboard</Button>
          </>
        )}
      </Flex>
    </DashboardLayout>
  );
};

const InscribePage = () => {
  return (
    <Protected>
      <Inscribe />
    </Protected>
  );
};

export default InscribePage;
