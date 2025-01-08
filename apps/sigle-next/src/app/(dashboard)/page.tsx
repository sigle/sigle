'use client';

import { useStacksLogin } from '@/hooks/useStacksLogin';
import { Routes } from '@/lib/routes';
import { Button, Callout, Container, Heading } from '@radix-ui/themes';
import { IconInfoCircle } from '@tabler/icons-react';
import { useSession } from 'next-auth/react';
import NextLink from 'next/link';

export default function Home() {
  const { login } = useStacksLogin();
  const { data: session } = useSession();

  return (
    <div className="pb-20">
      <Container size="2" className="container mx-auto px-4 py-20 text-center">
        <Heading size="8">Web3 writing platform for Web3 writers</Heading>
        <Heading
          as="h2"
          size="4"
          weight="medium"
          className="mt-6 max-w-md mx-auto"
        >
          Sigle is a secured and open-source writing platform for web3 content
          creators, NFT projects, crypto analysts and more.
        </Heading>
        {!session ? (
          <Button size="3" className="mt-6" onClick={login}>
            Start Writing
          </Button>
        ) : (
          <Button size="3" color="gray" highContrast className="mt-6" asChild>
            <NextLink href={Routes.dashboard()}>View Dashboard</NextLink>
          </Button>
        )}
      </Container>

      <Container size="1">
        <Callout.Root>
          <Callout.Icon>
            <IconInfoCircle />
          </Callout.Icon>
          <Callout.Text>
            🚀 Welcome to the Sigle testnet! Please share your feedback with us
            on Discord.
          </Callout.Text>
        </Callout.Root>
      </Container>
    </div>
  );
}
