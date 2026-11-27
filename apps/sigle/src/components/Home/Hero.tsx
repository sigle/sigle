"use client";

import { IconCircleCheck } from "@tabler/icons-react";
import { useStacksLogin } from "@/hooks/useStacksLogin";
import { useSession } from "@/lib/auth-hooks";
import { Routes } from "@/lib/routes";
import { NextLink } from "../Shared/NextLink";
import { Button, buttonVariants } from "../ui/button";

/** A post as readers see it, with its proofs, to show the product. */
const PostPreview = () => (
  <div className="rounded-xl border border-border bg-background p-6 shadow-sm md:p-8">
    <p className="font-mono text-xs text-muted-foreground">
      sigle.io/writer.btc
    </p>
    <h2 className="mt-3 headline text-3xl text-balance">
      Notes on Digital Permanence
    </h2>
    <p className="mt-3 text-sm text-muted-foreground">
      Nov 22, 2026 · 4 min read
    </p>
    <div className="mt-6 space-y-2">
      <div className="h-2 w-full rounded-full bg-muted" />
      <div className="h-2 w-11/12 rounded-full bg-muted" />
      <div className="h-2 w-4/5 rounded-full bg-muted" />
      <div className="h-2 w-2/3 rounded-full bg-muted" />
    </div>
    <ul className="mt-6 space-y-2 border-t border-border pt-4 text-sm">
      <li className="flex items-center gap-2">
        <IconCircleCheck size={16} className="text-muted-foreground" />
        Archived on Arweave
      </li>
      <li className="flex items-center gap-2">
        <IconCircleCheck size={16} className="text-muted-foreground" />
        Timestamped on Bitcoin, block 925,117
      </li>
    </ul>
  </div>
);

export const HomeHero = () => {
  const { login } = useStacksLogin();
  const { data: session } = useSession();

  return (
    <section className="mx-auto grid max-w-5xl items-center gap-12 px-4 py-16 md:grid-cols-2 md:py-24">
      <div>
        <h1 className="headline text-4xl text-balance md:text-5xl">
          Write once. Own it forever.
        </h1>
        <p className="mt-5 text-pretty text-muted-foreground">
          A minimalist open-source writing platform. Publish stories under your
          .btc name or address, archived permanently on Arweave and
          cryptographically timestamped on Bitcoin.
        </p>

        <div className="mt-8">
          {!session ? (
            <>
              <Button size="lg" className="h-11 px-5" onClick={login}>
                Connect wallet to start writing
              </Button>
              <p className="mt-3 text-sm text-muted-foreground">
                Supports Leather &amp; Xverse ·{" "}
                <span className="whitespace-nowrap">
                  No passwords, no lock-in.
                </span>
              </p>
            </>
          ) : (
            <NextLink
              href={Routes.dashboard()}
              className={buttonVariants({ size: "lg", className: "h-11 px-5" })}
            >
              Go to dashboard
            </NextLink>
          )}
        </div>
      </div>

      <PostPreview />
    </section>
  );
};
