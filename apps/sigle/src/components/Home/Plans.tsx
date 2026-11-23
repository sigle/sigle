"use client";

import { useStacksLogin } from "@/hooks/useStacksLogin";
import { useSession } from "@/lib/auth-hooks";
import { NextLink } from "../Shared/NextLink";
import { PlanComparison } from "../Shared/PlanComparison";
import { Button, buttonVariants } from "../ui/button";

/**
 * Asks to connect a wallet when signed out, and links to `href` once signed
 * in.
 */
const PlanAction = ({
  href,
  label,
  variant,
}: {
  href: string;
  label: { signedOut: string; signedIn: string };
  variant: "default" | "outline";
}) => {
  const { login } = useStacksLogin();
  const { data: session } = useSession();

  return session ? (
    <NextLink
      href={href}
      className={buttonVariants({ variant, size: "lg", className: "w-full" })}
    >
      {label.signedIn}
    </NextLink>
  ) : (
    <Button variant={variant} size="lg" className="w-full" onClick={login}>
      {label.signedOut}
    </Button>
  );
};

export const HomePlans = () => (
  <section className="mx-auto mt-24 max-w-5xl px-4 md:mt-32">
    <h2 className="mb-6 headline text-3xl">Free to start, Pro for holders</h2>

    <PlanComparison
      actions={{
        free: (
          <PlanAction
            href="/p/new"
            label={{ signedOut: "Start writing", signedIn: "Start writing" }}
            variant="outline"
          />
        ),
        pro: (
          <PlanAction
            href="/dashboard/plan"
            label={{
              signedOut: "Connect wallet to unlock",
              signedIn: "Unlock Pro",
            }}
            variant="default"
          />
        ),
      }}
    />
  </section>
);
