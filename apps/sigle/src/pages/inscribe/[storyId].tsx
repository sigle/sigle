import { useQuery } from '@tanstack/react-query';
import { useRouter } from 'next/router';
import React, { useState } from 'react';
import * as Sentry from '@sentry/nextjs';
import { toast } from 'sonner';
import { useConnect } from '@stacks/connect-react';
import { StacksMainnet } from '@stacks/network';
import {
  createMessageSignature,
  getAddressFromPublicKey,
  publicKeyFromSignatureRsv,
} from '@stacks/transactions';
import { bytesToHex } from '@stacks/common';
import { hashMessage, verifyMessageSignatureRsv } from '@stacks/encryption';
import { Protected } from '../../components/authentication/protected';
import { getStoryFile, saveStoryFile } from '../../utils';
import { migrationStory } from '../../utils/migrations/story';
import { DashboardLayout } from '../../modules/layout';
import { Button, Flex, Typography } from '../../ui';
import { useAuth } from '../../modules/auth/AuthContext';
import { appConfig } from '../../utils/stacks';
import { styled } from '../../stitches.config';
// import { NftLockedView } from '../../modules/analytics/NftLockedView';

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

const StyledInput = styled('input', {
  color: '$gray11',
  border: '1px solid $gray8',
  backgroundColor: '$gray1',
  borderRadius: '$2',
  fontSize: '16px',
  lineHeight: '26px',
  py: '$2',
  px: '$3',
  width: '100%',
  outline: 'none',
  transition: 'all 75ms $ease-in',

  '::placeholder': {
    color: '$gray8',
  },
  '&:hover': {
    border: '1px solid $gray9',
  },
  '&:focus': {
    border: '1px solid $gray9',
  },
  '&:disabled': {
    pointerEvents: 'none',
    backgroundColor: '$gray3',
    border: '1px solid $gray6',
  },
});

const Inscribe = () => {
  const { user } = useAuth();
  const router = useRouter();
  const { storyId } = router.query as { storyId: string };
  const { sign } = useConnect();
  const [signedData, setSignedData] = useState<string | null>(null);

  const { data, refetch } = useQuery(
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
    },
  );

  // if (!isLoading && !userSubscription) {
  //   return (
  //     <DashboardLayout>
  //       <NftLockedView />
  //     </DashboardLayout>
  //   );
  // }

  if (!data) {
    return null;
  }

  const parsedData = {
    p: 'ons',
    op: 'post',
    id: data.id,
    author: user?.username,
    authorAddress: user?.profile?.stxAddress?.mainnet,
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

  const handleSubmitLink = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();

    const inscriptionId = (event.target as any).inscriptionId.value;

    // Call the api to get the inscription data
    let data = await fetch(
      `https://inscribe.news/api/content/${inscriptionId}`,
    );
    if (!data.ok) {
      return toast.error('Invalid response from api');
    }
    let json = await data.json();
    if (json.p !== 'ons' || json.op !== 'post' || !json.signature) {
      return toast.error('Invalid data');
    }

    const message = JSON.stringify({ ...json, signature: undefined });
    // We verify the signature is valid
    const recoveredPublicKey = publicKeyFromSignatureRsv(
      bytesToHex(hashMessage(message)),
      createMessageSignature(json.signature),
    );
    const recoveredAddress = getAddressFromPublicKey(recoveredPublicKey);
    if (json.authorAddress !== recoveredAddress) {
      console.log(json.authorAddress, recoveredAddress);
      return toast.error(`address does not belong to publicKey`);
    }
    if (
      !verifyMessageSignatureRsv({
        message,
        publicKey: recoveredPublicKey,
        signature: json.signature,
      })
    ) {
      return toast.error(`Signature does not belong to issuer`);
    }

    data = await fetch(`https://inscribe.news/api/info/${inscriptionId}`);
    if (!data.ok) {
      return toast.error('Invalid response from api');
    }
    json = await data.json();

    // Link the inscription in Gaia
    const file = await getStoryFile(storyId);
    if (!file) {
      return toast.error('Story not found');
    }
    file.inscriptionId = json.id;
    file.inscriptionNumber = json.number;
    await saveStoryFile(file);

    await refetch();
    toast.success('Inscription linked');
  };

  if (data.inscriptionId) {
    return (
      <DashboardLayout>
        <Typography size="h2">Inscription #{data.inscriptionNumber}</Typography>
      </DashboardLayout>
    );
  }

  return (
    <DashboardLayout>
      <Typography size="h2">Inscribe (Beta)</Typography>
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

      <Flex direction="column" css={{ mt: '$10', mb: '$10' }}>
        <Typography size="h2">Link Inscription</Typography>
        <Typography size="subheading" css={{ mt: '$2' }}>
          To link the inscription to your story, please enter the inscription id
          below.
        </Typography>
        <Flex
          gap="4"
          align="center"
          css={{ mt: '$2' }}
          as="form"
          onSubmit={handleSubmitLink}
        >
          <StyledInput placeholder="Inscription ID" name="inscriptionId" />
          <Button size="lg" type="submit">
            Link
          </Button>
        </Flex>
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
