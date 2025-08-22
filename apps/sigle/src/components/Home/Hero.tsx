"use client";

import { Button, Container, Heading } from "@radix-ui/themes";
import { useStacksLogin } from "@/hooks/useStacksLogin";
import { useSession } from "@/lib/auth-hooks";
import { Routes } from "@/lib/routes";
import { NextLink } from "../Shared/NextLink";

export const HomeHero = () => {
  const { login } = useStacksLogin();
  const { data: session } = useSession();

  return (
    <Container
      size="2"
      className="container mx-auto px-4 py-10 text-center md:py-20"
    >
      <Heading size="8">Web3 writing platform for Web3 writers</Heading>
      <Heading
        as="h2"
        size="4"
        weight="medium"
        className="mx-auto mt-6 max-w-md"
      >
        Sigle is a secured and open-source writing platform for web3 content
        creators, NFT projects, crypto analysts and more.
      </Heading>
      {!session ? (
        <Button size="3" className="mt-6" onClick={login}>
          Start Writing
        </Button>
      ) : (
        <div className="mt-6 space-x-2">
          <Button size="3" color="gray" variant="outline" highContrast asChild>
            <NextLink href={Routes.explore()}>Explore</NextLink>
          </Button>
          <Button size="3" color="gray" highContrast asChild>
            <NextLink href={Routes.dashboard()}>View Dashboard</NextLink>
          </Button>
        </div>
      )}
    </Container>
  );
};
