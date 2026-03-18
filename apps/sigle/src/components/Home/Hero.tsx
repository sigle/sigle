"use client";

import { useStacksLogin } from "@/hooks/useStacksLogin";
import { useSession } from "@/lib/auth-hooks";
import { Routes } from "@/lib/routes";
import { NextLink } from "../Shared/NextLink";
import { Button } from "../ui/button";

export const HomeHero = () => {
  const { login } = useStacksLogin();
  const { data: session } = useSession();

  return (
    <div className="container mx-auto px-4 py-10 text-center md:py-20">
      <h1 className="text-4xl font-bold">
        Web3 writing platform for Web3 writers
      </h1>
      <h2 className="mx-auto mt-6 max-w-md text-lg font-medium">
        Sigle is a secured and open-source writing platform for web3 content
        creators, NFT projects, crypto analysts and more.
      </h2>

      <div className="mt-6 space-x-3">
        <Button
          size="lg"
          variant="outline"
          nativeButton={false}
          render={<NextLink href={Routes.explore()}>Explore</NextLink>}
        />
        {!session ? (
          <Button size="lg" onClick={login}>
            Start Writing
          </Button>
        ) : (
          <Button
            size="lg"
            nativeButton={false}
            render={
              <NextLink href={Routes.dashboard()}>View Dashboard</NextLink>
            }
          />
        )}
      </div>
    </div>
  );
};
