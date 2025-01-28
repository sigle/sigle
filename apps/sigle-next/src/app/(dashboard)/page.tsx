'use client';

import { HomeTrendingUsers } from '@/components/Home/TrendingUsers';
import { useStacksLogin } from '@/hooks/useStacksLogin';
import { Routes } from '@/lib/routes';
import { Button, Callout, Container, Heading, Text } from '@radix-ui/themes';
import { IconInfoCircle } from '@tabler/icons-react';
import { useSession } from 'next-auth/react';
import NextLink from 'next/link';

export const dynamic = 'force-dynamic';

export default function Home() {
  const { login } = useStacksLogin();
  const { data: session } = useSession();

  return (
    <div className="pb-20">
      <Container
        size="2"
        className="container mx-auto px-4 py-10 text-center md:py-20"
      >
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

      <Container size="1" className="px-4">
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

      <Container size="4" className="mt-10 px-4 md:mt-20">
        <section className="grid grid-cols-1 gap-x-6 md:grid-cols-3">
          <div className="flex flex-col items-center text-center gap-4 p-6 rounded-xl shadow-md">
            <Heading as="h3" size="4">
              ⛓️ Write on-chain
            </Heading>
            <Text as="p" color="gray" size="3" className="text-balance">
              {/* Every article lives <Text weight="medium">on-chain</Text>. */}
              Inscribe your words as Ordinals and make them live forever.
            </Text>
          </div>
          <div className="flex flex-col items-center text-center gap-4 p-6 rounded-xl shadow-md">
            <Heading as="h3" size="4">
              💰 Earn Bitcoin
            </Heading>
            <Text as="p" color="gray" size="3" className="text-balance">
              Turn readers into collectors with direct{' '}
              <Text weight="medium">sBTC</Text> payments to your wallet.
            </Text>
          </div>
          <div className="flex flex-col items-center text-center gap-4 p-6 rounded-xl shadow-md">
            <Heading as="h3" size="4">
              ⚡ Full Control
            </Heading>
            <Text as="p" color="gray" size="3" className="text-balance">
              Your content, your rules. Build anything with our{' '}
              <Text weight="medium">API, SDKs, and developer tools</Text>.
            </Text>
          </div>
        </section>
      </Container>

      <HomeTrendingUsers />
    </div>
  );
}
